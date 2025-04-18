import { Building } from 'lucide-react'
import { Label } from "../../ui/label"
import { Organization } from "./organization"
import OrganizationGrid from './OrganizationGrid'

interface ExistingOrganizationTabProps {
  availableOrganizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
}

const ExistingOrganizationTab = ({
  availableOrganizations,
  selectedOrganization,
  setSelectedOrganization
}: ExistingOrganizationTabProps) => {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2 block">
          Select an Organization
        </Label>
        <p className="text-sm text-zinc-500 mb-4">
          Choose from your existing organizations
        </p>
      </div>
      
      <OrganizationGrid 
        organizations={availableOrganizations}
        selectedOrganization={selectedOrganization}
        onSelect={setSelectedOrganization}
      />
      
      {selectedOrganization && (
        <div className="mt-6">
          <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2 block">
            Selected Organization
          </Label>
          <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center text-white">
                <Building size={20} />
              </div>
              <div>
                <h3 className="font-medium text-zinc-900">{selectedOrganization.name}</h3>
                <p className="text-xs text-zinc-500">Organization ID: {selectedOrganization.id}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExistingOrganizationTab;
