import React from "react";
import PageHeader from "../components/common/PageHeader";
import TeamContent from "../components/common/TeamContent";

const Team = () => {
  return (
    <div>
      <PageHeader
        title="Our Team"
        subtitle="Meet the passionate professionals who craft, guide, and support your extraordinary East African adventures."
        backgroundImage="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1920"
        breadcrumbs={[{ label: "Team" }]}
      />
      <TeamContent />
    </div>
  );
};

export default Team;