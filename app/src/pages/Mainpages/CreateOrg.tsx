// src/components/organization/CreateOrg.tsx
import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import Loader from '../../components/ui/Loader'

import NewOrganizationTab from '../../components/comps/organisation/NewOrganizationTab'
import ExistingOrganizationTab from '../../components/comps/organisation/ExistingOrganizationTab'
import OrganizationFooter from '../../components/comps/organisation/OrganizationFooter'
import OrganizationHeader from '../../components/comps/organisation/OrganizationHeader'
import { Member, Organization } from '../../components/comps/organisation/organization'
import { api } from '../../services/axios'

interface CreateOrgProps {
  createorgtoggle: boolean;
  setorgtoggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateOrg = ({ createorgtoggle, setorgtoggle }: CreateOrgProps) => {
  const [activeTab, setActiveTab] = useState<string>('new')
  const [availableMembers, setAvailableMembers] = useState<Member[]>([])
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [newOrganizationName, setNewOrganizationName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [newNameFromExisting, setNewNameFromExisting] = useState<string>('')
  
  // Reset selections when changing tabs
  useEffect(() => {
    if (activeTab === 'new') {
      setSelectedOrganization(null)
      setNewNameFromExisting('')
    } else {
      setSelectedMembers([])
      setNewOrganizationName('')
    }
  }, [activeTab])

  // Fetch members and organizations when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // Fetch members
        const membersRes = await api.get("/organisation/ge_org")
        setAvailableMembers(membersRes.data)
        
        // Fetch organizations
        const orgsRes = await api.get("/organisation/get_organization")
        setAvailableOrganizations(orgsRes.data.organisations || [])
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }
  
    fetchData()
  }, [])
  
  if (!createorgtoggle) {
    return null
  }
  
  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      if (activeTab === 'new') {
        const res = await api.post("/organisation/Org_creation_with_user", {
          orgName: newOrganizationName,
          users: selectedMembers
        });
        console.log('Response:', res);
      } else if (selectedOrganization) {
        // Create new organization based on existing one
        const res = await api.post("/organisation/Org_creation_with_user", {
          orgName: newNameFromExisting,
          templateOrgId: selectedOrganization.id
        });
        console.log('Created from existing template:', res);
      }
  
      // Close modal after submission
      setorgtoggle(false);
    } catch (error) {
      console.error('Error during organization creation:', error);
      // Optionally, you can show a user-friendly message
      alert('An error occurred while creating the organization. Please try again.');
    } finally {
      setIsSubmitting(false)
    }
  };
  
  const isSubmitEnabled = 
    (activeTab === 'new' && selectedMembers.length > 0 && newOrganizationName.trim() !== '') ||
    (activeTab === 'existing' && selectedOrganization !== null && newNameFromExisting.trim() !== '');
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white rounded-xl shadow-2xl p-0 max-h-[90vh] flex flex-col">
        <OrganizationHeader onClose={() => setorgtoggle(false)} />
        
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8">
              <Loader text="Loading organization data..." />
            </div>
          ) : (
            <div className="p-4 sm:p-6 pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 sm:mb-6">
                  <TabsTrigger value="new" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    New Organization
                  </TabsTrigger>
                  <TabsTrigger value="existing" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Existing Organization
                  </TabsTrigger>
                </TabsList>
                
                <div className="overflow-y-auto">
                  <TabsContent value="new" className="mt-0">
                    <NewOrganizationTab 
                      availableMembers={availableMembers}
                      selectedMembers={selectedMembers}
                      setSelectedMembers={setSelectedMembers}
                      organizationName={newOrganizationName}
                      setOrganizationName={setNewOrganizationName}
                    />
                  </TabsContent>
                  
                  <TabsContent value="existing" className="mt-0">
                    <ExistingOrganizationTab 
                      availableOrganizations={availableOrganizations}
                      selectedOrganization={selectedOrganization}
                      setSelectedOrganization={setSelectedOrganization}
                      newOrganizationName={newNameFromExisting}
                      setNewOrganizationName={setNewNameFromExisting}
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
          
          <OrganizationFooter 
            activeTab={activeTab}
            organizationName={activeTab === 'new' ? newOrganizationName : newNameFromExisting}
            memberCount={selectedMembers.length}
            selectedOrganization={selectedOrganization}
            isSubmitEnabled={isSubmitEnabled && !isLoading}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </Card>
    </div>
  )
}

export default CreateOrg