// src/components/organization/CreateOrg.tsx
import { useState, useEffect } from 'react'
import { Card } from '../../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { MOCK_MEMBERS, MOCK_ORGANIZATIONS } from '../../components/comps/organisation/mockdata'

import NewOrganizationTab from '../../components/comps/organisation/NewOrganizationTab'
import ExistingOrganizationTab from '../../components/comps/organisation/ExistingOrganizationTab'
import OrganizationFooter from '../../components/comps/organisation/OrganizationFooter'
import OrganizationHeader from '../../components/comps/organisation/OrganizationHeader'
import { Member,Organization } from '../../components/comps/organisation/organization'
import { api } from '../../services/axios'

interface CreateOrgProps {
  createorgtoggle: boolean;
  setorgtoggle: React.Dispatch<React.SetStateAction<boolean>>;
}

const CreateOrg = ({ createorgtoggle, setorgtoggle }: CreateOrgProps) => {
  const [activeTab, setActiveTab] = useState<string>('new')
  const [availableMembers,setavailableMembers] = useState<Member[]>(MOCK_MEMBERS)
  const [availableOrganizations] = useState<Organization[]>(MOCK_ORGANIZATIONS)
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [newOrganizationName, setNewOrganizationName] = useState<string>('')
  
  // Reset selections when changing tabs
  useEffect(() => {
    if (activeTab === 'new') {
      setSelectedOrganization(null)
    } else {
      setSelectedMembers([])
    }
  }, [activeTab])
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get("/organisation/ge_org")
        console.log(res)
        setavailableMembers(res.data)
      } catch (err) {
        console.error('Error fetching members:', err)
      }
    }
  
    fetchMembers()
  }, [])
  
  if (!createorgtoggle) {
    return null
  }
  
  const handleSubmit = async () => {
    try {
      if (activeTab === 'new') {
        const res = await api.post("/organisation/Org_creation_with_user", {
          orgName:newOrganizationName,
          users:selectedMembers
        });
        console.log('Response:', res);
        console.log('New Organization:', {
          name: newOrganizationName,
          members: selectedMembers
        });
      } else {
        console.log('Selected Existing Organization:', selectedOrganization);
      }
  
      // Close modal after submission
      setorgtoggle(false);
    } catch (error) {
      console.error('Error during organization creation:', error);
      // Optionally, you can show a user-friendly message
      alert('An error occurred while creating the organization. Please try again.');
    }
  };
  
  
  const isSubmitEnabled = 
    (activeTab === 'new' && selectedMembers.length > 0 && newOrganizationName.trim() !== '') ||
    (activeTab === 'existing' && selectedOrganization !== null);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden p-0">
        <div className="flex flex-col h-[85vh] ">
          {/* Header */}
          <OrganizationHeader onClose={() => setorgtoggle(false)} />
          
          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col divide-y divide-zinc-200">
            {/* Tabs */}
            <div className="p-6 pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="new" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    New Organization
                  </TabsTrigger>
                  <TabsTrigger value="existing" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    Existing Organization
                  </TabsTrigger>
                </TabsList>
                
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
                  />
                </TabsContent>
              </Tabs>
            </div>
            
            <OrganizationFooter 
              activeTab={activeTab}
              organizationName={newOrganizationName}
              memberCount={selectedMembers.length}
              selectedOrganization={selectedOrganization}
              isSubmitEnabled={isSubmitEnabled}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CreateOrg