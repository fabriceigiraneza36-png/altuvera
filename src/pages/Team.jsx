import React from "react";
import PageHeader from "../components/common/PageHeader";
import TeamContent from "../components/common/TeamContent";

const Team = () => {
  return (
    <div>
      <PageHeader
        title="Our Team"
        subtitle="Meet the passionate professionals who craft, guide, and support your extraordinary East African adventures."
        backgroundImage="https://i.pinimg.com/736x/01/1b/ec/011becf0757dead7b3ff94de27293eeb.jpg"
        breadcrumbs={[{ label: "Team" }]}
      />
      <TeamContent />
    </div>
  );
};

export default Team;