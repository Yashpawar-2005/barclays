import { Building, SearchX } from 'lucide-react'
import { Organization } from "./organization"

interface OrganizationGridProps {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelect: (organization: Organization) => void;
  searchQuery?: string;
}

const OrganizationGrid = ({
  organizations,
  selectedOrganization,
  onSelect,
  searchQuery = ''
}: OrganizationGridProps) => {
  if (organizations.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-center">
        <div className="max-w-xs">
          {searchQuery ? (
            <>
              <div className="mx-auto bg-zinc-100 h-12 w-12 rounded-full flex items-center justify-center mb-3">
                <SearchX size={20} className="text-zinc-500" />
              </div>
              <h3 className="text-sm font-medium text-zinc-800 mb-1">No Results Found</h3>
              <p className="text-xs text-zinc-500">No organizations match your search criteria.</p>
            </>
          ) : (
            <>
              <div className="mx-auto bg-zinc-100 h-12 w-12 rounded-full flex items-center justify-center mb-3">
                <Building size={20} className="text-zinc-500" />
              </div>
              <h3 className="text-sm font-medium text-zinc-800 mb-1">No Organizations Available</h3>
              <p className="text-xs text-zinc-500">There are no organizations available. Please create a new one.</p>
            </>
          )}
        </div>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 overflow-y-auto h-full">
      {organizations.map((org) => (
        <div
          key={org.id}
          className={`
            p-3 sm:p-4 border rounded-lg cursor-pointer transition-all
            ${selectedOrganization?.id === org.id 
              ? 'border-black bg-black/5 shadow-md' 
              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
          `}
          onClick={() => onSelect(org)}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`
              h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center shrink-0
              ${selectedOrganization?.id === org.id ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}
            `}>
              <Building size={16} className="sm:hidden" />
              <Building size={18} className="hidden sm:block" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="font-medium text-zinc-900 text-sm sm:text-base truncate">{org.name}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationGrid;