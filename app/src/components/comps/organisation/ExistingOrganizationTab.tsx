import { Building, Search } from 'lucide-react'
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Organization } from "./organization"
import OrganizationGrid from './OrganizationGrid'
import Loader from '../../ui/Loader'
import { useState, useEffect } from 'react'

interface ExistingOrganizationTabProps {
  availableOrganizations: Organization[];
  selectedOrganization: Organization | null;
  setSelectedOrganization: React.Dispatch<React.SetStateAction<Organization | null>>;
  newOrganizationName: string;
  setNewOrganizationName: React.Dispatch<React.SetStateAction<string>>;
}

const ExistingOrganizationTab = ({
  availableOrganizations,
  selectedOrganization,
  setSelectedOrganization,
  newOrganizationName,
  setNewOrganizationName
}: ExistingOrganizationTabProps) => {
  const isLoading = availableOrganizations.length === 0;
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredOrganizations(availableOrganizations);
    } else {
      const filtered = availableOrganizations.filter(org => 
        org.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOrganizations(filtered);
    }
  }, [searchQuery, availableOrganizations]);

  return (
    <div className="flex flex-col space-y-4 sm:space-y-5 overflow-y-auto h-full pb-4">
      <div>
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1 sm:mb-2 block">
          Select an Organization Template
        </Label>
        <p className="text-xs sm:text-sm text-zinc-500 mb-3 sm:mb-4">
          Choose from your existing organizations
        </p>
      </div>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search size={16} className="text-zinc-400" />
        </div>
        <Input
          type="text"
          placeholder="Search organizations..."
          className="pl-10 bg-zinc-50 border-zinc-200 focus:ring-black focus:border-black text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading}
        />
      </div>
      
      <div className="flex-1 min-h-0">
        {isLoading ? (
          <Loader text="Loading organizations..." />
        ) : (
          <OrganizationGrid 
            organizations={filteredOrganizations}
            selectedOrganization={selectedOrganization}
            onSelect={setSelectedOrganization}
            searchQuery={searchQuery}
          />
        )}
      </div>
      
      {selectedOrganization && (
        <>
          <div className="mt-4 sm:mt-5">
            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-1.5 sm:mb-2 block">
              Selected Organization Template
            </Label>
            <div className="p-3 sm:p-4 rounded-lg bg-zinc-50 border border-zinc-200">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-black flex items-center justify-center text-white shrink-0">
                  <Building size={16} className="sm:hidden" />
                  <Building size={20} className="hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-medium text-zinc-900 text-sm sm:text-base truncate">{selectedOrganization.name}</h3>
                  <p className="text-xs text-zinc-500 truncate">Organization ID: {selectedOrganization.id}</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="new-org-name-from-existing" className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
              New Organization Name
            </Label>
            <Input
              id="new-org-name-from-existing"
              placeholder="Enter name for your new organization"
              value={newOrganizationName}
              onChange={(e) => setNewOrganizationName(e.target.value)}
              className="bg-zinc-50 border-zinc-200 focus:ring-black focus:border-black text-sm sm:text-base"
            />
            <p className="text-xs text-zinc-500 mt-1">
              This will create a new organization based on the selected template.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ExistingOrganizationTab;
