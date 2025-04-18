import { Building } from 'lucide-react'
import { Organization } from "./organization.ts"


interface OrganizationGridProps {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  onSelect: (organization: Organization) => void;
}

const OrganizationGrid = ({
  organizations,
  selectedOrganization,
  onSelect
}: OrganizationGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {organizations.map((org) => (
        <div
          key={org.id}
          className={`
            p-4 border rounded-lg cursor-pointer transition-all
            ${selectedOrganization?.id === org.id 
              ? 'border-black bg-black/5 shadow-md' 
              : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
          `}
          onClick={() => onSelect(org)}
        >
          <div className="flex items-center gap-3">
            <div className={`
              h-10 w-10 rounded-full flex items-center justify-center
              ${selectedOrganization?.id === org.id ? 'bg-black text-white' : 'bg-zinc-100 text-zinc-500'}
            `}>
              <Building size={18} />
            </div>
            <div className="flex-grow">
              <h3 className="font-medium text-zinc-900">{org.name}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrganizationGrid;