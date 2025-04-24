// src/pages/Organisationpage/Orgid.tsx

import React from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../../components/ui/button";
import OrganizationSidebar from "../../components/comps/Sidebars.tsx/Leftsidebar2";
import { TermsheetSection } from "../../components/comps/Rightsidebars/Rightsidebar";

export default function OrgidPage() {
  const { id: orgId } = useParams<{ id: string }>();

  return (
    <div className="flex flex-row">
      <OrganizationSidebar />

       <div className="flex-1 p-6 bg-gray-50">
        

        {/* existing listing/processing section */}
        <TermsheetSection />
      </div>
    </div>
  );
}
