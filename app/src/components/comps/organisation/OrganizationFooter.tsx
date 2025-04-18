import { Button } from '../../ui/button'
import { Organization } from "./organization"
import Loader from '../../ui/Loader'

interface OrganizationFooterProps {
  activeTab: string;
  organizationName: string;
  memberCount: number;
  selectedOrganization: Organization | null;
  isSubmitEnabled: boolean;
  onSubmit: () => void;
  isSubmitting?: boolean;
}

const OrganizationFooter = ({
  activeTab,
  organizationName,
  memberCount,
  selectedOrganization,
  isSubmitEnabled,
  onSubmit,
  isSubmitting = false
}: OrganizationFooterProps) => {
  return (
    <div className="px-4 sm:px-6 py-4 mt-auto bg-zinc-50 w-full">
      <div className="flex flex-col gap-3 sm:gap-4 max-h-[30vh] overflow-y-auto">
        {activeTab === 'new' ? (
          <div className="min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm mb-2 space-y-1 sm:space-y-0">
              <span className="text-zinc-500 truncate">Organization Name</span>
              <span className="font-medium truncate">{organizationName || 'Not set'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
              <span className="text-zinc-500 truncate">Members</span>
              <span className="font-medium truncate">{memberCount} selected</span>
            </div>
          </div>
        ) : (
          <div className="min-w-0 overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm mb-2 space-y-1 sm:space-y-0">
              <span className="text-zinc-500 truncate">Template Organization</span>
              <span className="font-medium truncate">{selectedOrganization ? selectedOrganization.name : 'None selected'}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm space-y-1 sm:space-y-0">
              <span className="text-zinc-500 truncate">New Organization Name</span>
              <span className="font-medium truncate">{organizationName || 'Not set'}</span>
            </div>
          </div>
        )}
        
        <Button 
          onClick={onSubmit}
          disabled={!isSubmitEnabled || isSubmitting}
          className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-3 sm:py-5 text-sm sm:text-base mt-2"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-white" />
              <span>Processing...</span>
            </div>
          ) : (
            activeTab === 'new' ? 'Create Organization' : 'Create From Template'
          )}
        </Button>
      </div>
    </div>
  );
};

export default OrganizationFooter;