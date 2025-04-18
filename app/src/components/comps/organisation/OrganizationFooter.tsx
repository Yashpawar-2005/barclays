import { Button } from '../../ui/button'
import { Organization } from "./organization.ts"

interface OrganizationFooterProps {
  activeTab: string;
  organizationName: string;
  memberCount: number;
  selectedOrganization: Organization | null;
  isSubmitEnabled: boolean;
  onSubmit: () => void;
}

const OrganizationFooter = ({
  activeTab,
  organizationName,
  memberCount,
  selectedOrganization,
  isSubmitEnabled,
  onSubmit
}: OrganizationFooterProps) => {
  return (
    <div className="px-6 py-4 mt-auto bg-zinc-50">
      <div className="flex flex-col gap-4">
        {activeTab === 'new' ? (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-zinc-500">Organization Name</span>
              <span className="font-medium">{organizationName || 'Not set'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Members</span>
              <span className="font-medium">{memberCount} selected</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Organization</span>
            <span className="font-medium">{selectedOrganization ? selectedOrganization.name : 'None selected'}</span>
          </div>
        )}
        
        <Button 
          onClick={onSubmit}
          disabled={!isSubmitEnabled}
          className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-5"
          
        >
          {activeTab === 'new' ? 'Create Organization' : 'Use Selected Organization'}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationFooter;