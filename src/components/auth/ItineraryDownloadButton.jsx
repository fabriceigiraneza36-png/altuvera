import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Download, LoaderCircle } from "lucide-react";
import { API_URL } from "../../utils/apiBase";

const safeText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

export default function ItineraryDownloadButton({ booking, itinerary }) {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 17;
      const contentWidth = pageWidth - margin * 2;
      let y = 18;

      const imageToDataUrl = (url, targetAspect = null) => new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.onload = () => {
          try {
            const sourceWidth = image.naturalWidth || image.width;
            const sourceHeight = image.naturalHeight || image.height;
            let sx = 0;
            let sy = 0;
            let sw = sourceWidth;
            let sh = sourceHeight;
            if (targetAspect && sourceWidth / sourceHeight > targetAspect) {
              sw = sourceHeight * targetAspect;
              sx = (sourceWidth - sw) / 2;
            } else if (targetAspect && sourceWidth / sourceHeight < targetAspect) {
              sh = sourceWidth / targetAspect;
              sy = (sourceHeight - sh) / 2;
            }
            const canvas = document.createElement("canvas");
            canvas.width = targetAspect ? 1400 : sourceWidth;
            canvas.height = targetAspect ? Math.round(1400 / targetAspect) : sourceHeight;
            const context = canvas.getContext("2d");
            if (!context) return reject(new Error("Canvas unavailable"));
            context.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL("image/png"));
          } catch (error) { reject(error); }
        };
        image.onerror = reject;
        image.src = url;
      });

      const makeFadedBackground = (sourceData, opacity = 0.15) => new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            canvas.width = 1400;
            canvas.height = Math.round(1400 * pageHeight / pageWidth);
            const context = canvas.getContext("2d");
            if (!context) return reject(new Error("Canvas unavailable"));
            context.fillStyle = "#f7fff9";
            context.fillRect(0, 0, canvas.width, canvas.height);
            const sourceWidth = image.naturalWidth || image.width;
            const sourceHeight = image.naturalHeight || image.height;
            const scale = Math.max(canvas.width / sourceWidth, canvas.height / sourceHeight);
            const width = sourceWidth * scale;
            const height = sourceHeight * scale;
            context.globalAlpha = opacity;
            context.drawImage(image, (canvas.width - width) / 2, (canvas.height - height) / 2, width, height);
            resolve(canvas.toDataURL("image/png"));
          } catch (error) { reject(error); }
        };
        image.onerror = reject;
        image.src = sourceData;
      });

      const pickDestinationImage = (record) => {
        if (!record || typeof record !== "object") return "";
        const galleryImage = Array.isArray(record.gallery) ? record.gallery.find(Boolean) : null;
        const firstImage = Array.isArray(record.images) ? record.images.find(Boolean) : null;
        const candidates = [
          record.destination_image_url, record.destinationImageUrl, record.destination_image, record.destinationImage,
          record.hero_image_url, record.heroImageUrl, record.hero_image, record.heroImage,
          record.cover_image_url, record.coverImageUrl, record.image_url, record.imageUrl,
          record.thumbnail_url, record.thumbnailUrl, record.image,
          record.destination?.hero_image_url, record.destination?.heroImageUrl,
          record.destination?.cover_image_url, record.destination?.coverImageUrl,
          record.destination?.image_url, record.destination?.imageUrl, record.destination?.image,
          firstImage?.imageUrl, firstImage?.image_url, firstImage?.url, firstImage?.src,
          galleryImage?.imageUrl, galleryImage?.image_url, galleryImage?.url, galleryImage?.src,
          typeof firstImage === "string" ? firstImage : "",
          typeof galleryImage === "string" ? galleryImage : "",
        ];
        return candidates.find((value) => typeof value === "string" && value.trim())?.trim() || "";
      };

      let destinationImageUrl = pickDestinationImage(booking) || pickDestinationImage(itinerary);
      if (!destinationImageUrl) {
        const destinationId = booking?.destination_id || booking?.destinationId || booking?.destination?.id ||
          itinerary?.destination_id || itinerary?.destinationId;
        if (destinationId) {
          try {
            const response = await fetch(`${API_URL}/destinations/${encodeURIComponent(destinationId)}`);
            if (response.ok) {
              const payload = await response.json();
              const destination = payload?.data?.destination || payload?.data || payload?.destination || payload;
              destinationImageUrl = pickDestinationImage(destination);
            }
          } catch { /* image is optional; the PDF content can still be downloaded */ }
        }
      }

      let logoData = null;
      let destinationImageData = null;
      let destinationBackgroundData = null;
      try { logoData = await imageToDataUrl(new URL("/altuvera.png", window.location.origin).href); } catch { /* keep the PDF usable if the logo cannot load */ }
      if (destinationImageUrl) {
        try { destinationImageData = await imageToDataUrl(new URL(destinationImageUrl, window.location.origin).href, contentWidth / 48); }
        catch { /* a cross-origin image without CORS should not prevent PDF downloads */ }
      }
      if (itinerary?.backgroundMode === "destination" && destinationImageUrl) {
        try {
          const portraitBackgroundData = await imageToDataUrl(
            new URL(destinationImageUrl, window.location.origin).href,
            pageWidth / pageHeight,
          );
          destinationBackgroundData = await makeFadedBackground(portraitBackgroundData, 0.12);
        } catch { /* Keep the standard white background if an image cannot be processed safely. */ }
      }

      const drawPageBackground = () => {
        if (!destinationBackgroundData) return;
        pdf.addImage(destinationBackgroundData, "PNG", 0, 0, pageWidth, pageHeight, "altuvera-itinerary-background", "FAST");
      };
      drawPageBackground();

      const addPageIfNeeded = (height = 8) => {
        if (y + height > pageHeight - 17) {
          pdf.addPage();
          drawPageBackground();
          y = 18;
        }
      };
      const line = (text, options = {}) => {
        const fontSize = options.fontSize || 10;
        pdf.setFont("helvetica", options.bold ? "bold" : "normal");
        pdf.setFontSize(fontSize);
        const lines = pdf.splitTextToSize(safeText(text), contentWidth - (options.indent || 0));
        const height = lines.length * (fontSize * 0.48) + (options.gapAfter ?? 2);
        addPageIfNeeded(height);
        pdf.setTextColor(...(options.color || [51, 65, 85]));
        pdf.text(lines, margin + (options.indent || 0), y);
        y += height;
      };

      pdf.setFillColor(6, 78, 59);
      pdf.roundedRect(margin, y, contentWidth, 34, 3, 3, "F");
      if (logoData) {
        const props = pdf.getImageProperties(logoData);
        const ratio = props.width / Math.max(1, props.height);
        const width = Math.min(34, 17 * ratio);
        pdf.addImage(logoData, "PNG", pageWidth - margin - width - 6, y + 5, width, width / Math.max(.01, ratio), undefined, "FAST");
      }
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(17);
      pdf.text(pdf.splitTextToSize(safeText(itinerary?.title || "Your Travel Itinerary"), contentWidth - 12), margin + 6, y + 10);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.setTextColor(209, 250, 229);
      pdf.text(safeText(booking?.destination_name || "Your journey"), margin + 6, y + 21);
      pdf.text("Booking: " + safeText(booking?.booking_number || "—"), margin + 6, y + 28);
      y += 42;

      if (destinationImageData) {
        addPageIfNeeded(54);
        pdf.setDrawColor(167, 243, 208);
        pdf.setLineWidth(0.5);
        pdf.roundedRect(margin, y, contentWidth, 48, 2.5, 2.5, "S");
        pdf.addImage(destinationImageData, "PNG", margin + 0.5, y + 0.5, contentWidth - 1, 47, undefined, "FAST");
        y += 55;
      }

      line("PERSONALIZED TRAVEL PLAN", { bold: true, fontSize: 9, color: [5, 150, 105], gapAfter: 4 });
      line("Traveller: " + (booking?.full_name || "—"));
      line("Country: " + (booking?.country_name || booking?.country || "—"));
      line("Arrival → Departure: " + (booking?.travel_date || booking?.arrival_date || "Flexible") + " to " + (booking?.end_date || booking?.return_date || booking?.departure_date || "—"));
      line("Number of travellers: " + (booking?.number_of_travelers || "—"), { gapAfter: 5 });
      if (itinerary?.introduction) line(itinerary.introduction, { gapAfter: 7 });

      (itinerary?.days || []).forEach((day, index) => {
        addPageIfNeeded(22);
        pdf.setFillColor(236, 253, 245);
        pdf.roundedRect(margin, y - 4, contentWidth, 10, 2, 2, "F");
        pdf.setTextColor(4, 120, 87);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(11);
        pdf.text("DAY " + (index + 1) + " · " + safeText(day.title || day.location || "Adventure day").slice(0, 90), margin + 3, y + 2.5);
        y += 13;
        if (day.date) line("Date: " + day.date, { bold: true });
        if (day.location) line("Location: " + day.location);
        (Array.isArray(day.activities) ? day.activities : []).forEach(activity => line("• " + (typeof activity === "string" ? activity : activity?.title || activity?.name || ""), { indent: 2, gapAfter: 1 }));
        if (day.transport) line("Transport: " + day.transport);
        if (day.accommodation) line("Accommodation: " + day.accommodation);
        if (day.meals) line("Meals: " + day.meals);
        if (day.notes) line("Notes: " + day.notes);
        y += 4;
      });

      if (itinerary?.inclusions?.length) {
        line("INCLUDED", { bold: true, fontSize: 11, color: [4, 120, 87], gapAfter: 4 });
        itinerary.inclusions.forEach(item => line("• " + item, { indent: 2 }));
      }
      if (itinerary?.essentials?.length) {
        line("TRAVEL ESSENTIALS", { bold: true, fontSize: 11, color: [4, 120, 87], gapAfter: 4 });
        itinerary.essentials.forEach(item => line("• " + item, { indent: 2 }));
      }
      if (itinerary?.contactNote) line("CONTACT NOTE: " + itinerary.contactNote);

      const pages = pdf.getNumberOfPages();
      for (let page = 1; page <= pages; page++) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.setTextColor(100, 116, 139);
        if (logoData) {
          const props = pdf.getImageProperties(logoData);
          const ratio = props.width / Math.max(1, props.height);
          const width = Math.min(24, 10 * ratio);
          pdf.addImage(logoData, "PNG", margin, pageHeight - 14, width, width / Math.max(.01, ratio), undefined, "FAST");
        }
        pdf.text(page + " / " + pages, pageWidth - margin, pageHeight - 8, { align: "right" });
      }
      pdf.save((booking?.booking_number || "altuvera") + "-itinerary.pdf");
    } catch (error) {
      console.error("[Itinerary PDF] Could not create itinerary PDF:", error);
      window.alert("We couldn't create the PDF just now. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button type="button" onClick={download} disabled={busy} style={{border:"1px solid #a7f3d0",borderRadius:11,padding:"10px 14px",background:"#fff",color:"#047857",fontWeight:800,fontSize:12,cursor:busy?"wait":"pointer",opacity:busy ? 0.7 : 1}}>
      {busy ? <LoaderCircle size={14} className="inline mr-1 animate-spin"/> : <Download size={14} className="inline mr-1"/>}
      {busy ? "Preparing PDF…" : "Download itinerary PDF"}
    </button>
  );
}
