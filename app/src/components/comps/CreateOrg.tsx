import { useState, useEffect } from 'react'
import { Check, X, User, Building, Search, Users, Plus } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from "../ui/input"
import { Card, CardContent } from '../ui/card'
import { Badge } from '../ui/badge'
import { Label } from "../ui/label"
import { ScrollArea } from "../ui/scroll-area"
import { Separator } from "../ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'

interface Member {
  id: string;
  name: string;
  role: string;
}

interface Organization {
  id: string;
  name: string;
}

interface CreateOrgProps {
  createorgtoggle: boolean;
  setorgtoggle:  React.Dispatch<React.SetStateAction<boolean>>
}

const CreateOrg = ({ createorgtoggle,setorgtoggle }: CreateOrgProps) => {
  // Sample data - in a real app, you would fetch this from an API
  const [availableMembers, setAvailableMembers] = useState<Member[]>([
    { id: '1', name: 'John Doe', role: '' },
    { id: '2', name: 'Jane Smith', role: '' },
    { id: '3', name: 'Michael Johnson', role: '' },
    { id: '4', name: 'Emily Brown', role: '' },
    { id: '5', name: 'David Wilson', role: '' },
    { id: '6', name: 'Sarah Taylor', role: '' },
    { id: '7', name: 'Robert Martin', role: '' },
    { id: '8', name: 'Lisa Anderson', role: '' },
  ])
  
  const [availableOrganizations, setAvailableOrganizations] = useState<Organization[]>([
    { id: '1', name: 'Marketing Team' },
    { id: '2', name: 'Development Team' },
    { id: '3', name: 'Design Team' },
    { id: '4', name: 'HR Department' },
  ])
  
  const [selectedMembers, setSelectedMembers] = useState<Member[]>([])
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  const [newOrganizationName, setNewOrganizationName] = useState<string>('')
  const [tempRole, setTempRole] = useState<string>('')
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [isSearching, setIsSearching] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('members')
  
  // This would be replaced with an actual API call in a real application
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true)
      
      // Simulate API call delay
      const timer = setTimeout(() => {
        // Filter members based on search query
        // In a real app, this would be a fetch to your endpoint
        const filteredMembers = [
          { id: '1', name: 'John Doe', role: '' },
          { id: '2', name: 'Jane Smith', role: '' },
          { id: '3', name: 'Michael Johnson', role: '' },
          { id: '4', name: 'Emily Brown', role: '' },
          { id: '5', name: 'David Wilson', role: '' },
          { id: '6', name: 'Sarah Taylor', role: '' },
          { id: '7', name: 'Robert Martin', role: '' },
          { id: '8', name: 'Lisa Anderson', role: '' },
        ].filter(member => 
          member.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        
        setAvailableMembers(filteredMembers)
        setIsSearching(false)
      }, 500)
      
      return () => clearTimeout(timer)
    } else {
      // Reset to original list if search is cleared
      setAvailableMembers([
        { id: '1', name: 'John Doe', role: '' },
        { id: '2', name: 'Jane Smith', role: '' },
        { id: '3', name: 'Michael Johnson', role: '' },
        { id: '4', name: 'Emily Brown', role: '' },
        { id: '5', name: 'David Wilson', role: '' },
        { id: '6', name: 'Sarah Taylor', role: '' },
        { id: '7', name: 'Robert Martin', role: '' },
        { id: '8', name: 'Lisa Anderson', role: '' },
      ])
    }
  }, [searchQuery])
  
  // Reset selections when changing tabs
  useEffect(() => {
    if (activeTab === 'members') {
      setSelectedOrganization(null)
    } else {
      setSelectedMembers([])
      setCurrentMember(null)
    }
  }, [activeTab])
  
  if (!createorgtoggle) {
    return null
  }
  
  const handleMemberSelection = (member: Member) => {
    setCurrentMember(member)
  }
  
  const assignRole = () => {
    if (currentMember && tempRole) {
      const updatedMember = { ...currentMember, role: tempRole }
      
      // Add to selected members if not already there
      if (!selectedMembers.some(m => m.id === updatedMember.id)) {
        setSelectedMembers([...selectedMembers, updatedMember])
      } else {
        // Update the role if member already selected
        setSelectedMembers(selectedMembers.map(m => 
          m.id === updatedMember.id ? updatedMember : m
        ))
      }
      
      // Reset states
      setCurrentMember(null)
      setTempRole('')
    }
  }
  
  const removeMember = (memberId: string) => {
    setSelectedMembers(selectedMembers.filter(m => m.id !== memberId))
  }
  
  const handleOrganizationSelect = (orgId: string) => {
    const org = availableOrganizations.find(o => o.id === orgId)
    if (org) {
      setSelectedOrganization(org)
    }
  }
  
  const handleSubmit = () => {
    // Process form submission - in a real app, you would send this data to an API
    if (activeTab === 'members') {
      console.log('Selected Members with Roles:', selectedMembers)
      console.log('New Organization Name:', newOrganizationName)
    } else {
      console.log('Selected Existing Organization:', selectedOrganization)
    }
    
    // You could add further processing here
    alert('Organization setup completed successfully!')
  }
  
  // Determine if submit should be enabled
  const isSubmitEnabled = 
    (activeTab === 'members' && selectedMembers.length > -0 && newOrganizationName.trim() !== '') ||
    (activeTab === 'existing' && selectedOrganization !== null);
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50">
      <Card className="w-full max-w-5xl bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex flex-col h-[85vh]">
          {/* Header */}
          <div className="px-8 py-6 bg-black text-white flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Organization Setup</h1>
              <p className="text-zinc-400 mt-1 text-sm">Configure members and organization</p>
            </div>
            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white">
            <X size={18} onClick={() => setorgtoggle(prev => !prev)} />
            </Button>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col divide-y divide-zinc-200">
            {/* Tabs */}
            <div className="p-6 pb-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="members" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    <Users size={16} className="mr-2" />
                    New Organization with Members
                  </TabsTrigger>
                  <TabsTrigger value="existing" className="data-[state=active]:bg-black data-[state=active]:text-white">
                    <Building size={16} className="mr-2" />
                    Use Existing Organization
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="members" className="mt-0">
                  <div className="flex flex-col md:flex-row h-full space-y-4 md:space-y-0 md:space-x-6">
                    {/* Left Section - Member Selection */}
                    <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <Label htmlFor="new-org-name" className="text-xs font-medium uppercase tracking-wide text-zinc-500 mb-2 block">
                          New Organization Name
                        </Label>
                        <Input
                          id="new-org-name"
                          placeholder="Enter organization name"
                          value={newOrganizationName}
                          onChange={(e) => setNewOrganizationName(e.target.value)}
                          className="bg-zinc-50 border-zinc-200 focus:ring-black focus:border-black"
                        />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <Users size={18} className="text-zinc-500" />
                        <h2 className="text-base font-medium text-zinc-900">Add Members</h2>
                      </div>
                      
                      {/* Search box */}
                      <div className="relative mb-4">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Search size={15} className="text-zinc-400" />
                        </div>
                        <Input
                          type="text"
                          placeholder="Search for members..."
                          className="pl-10 bg-zinc-50 border-zinc-200 focus:border-black focus:ring-black"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      {/* Currently assigning role */}
                      {currentMember && (
                        <div className="p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col gap-3 mb-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <User size={16} className="text-zinc-500" />
                              <span className="font-medium text-zinc-900">{currentMember.name}</span>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => setCurrentMember(null)}
                              className="h-7 w-7 p-0 rounded-full hover:bg-zinc-200"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                          <Separator className="bg-zinc-200" />
                          <div className="flex items-center gap-2">
                            <Input
                              placeholder="Enter role (e.g. Admin, Member)"
                              value={tempRole}
                              onChange={(e) => setTempRole(e.target.value)}
                              className="flex-1 bg-white border-zinc-200"
                            />
                            <Button 
                              onClick={assignRole} 
                              disabled={!tempRole}
                              className="bg-black text-white hover:bg-zinc-800"
                            >
                              <Check size={14} className="mr-1" />
                              Assign
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Member lists */}
                      <div className="flex-1 flex flex-col min-h-0">
                        {/* Available members */}
                        <div className="mb-4 flex-1 min-h-0 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Available Members</Label>
                            <Badge variant="outline" className="text-xs font-normal">
                              {availableMembers.length}
                            </Badge>
                          </div>
                          
                          {isSearching ? (
                            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
                              Searching...
                            </div>
                          ) : availableMembers.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm">
                              No members found
                            </div>
                          ) : (
                            <ScrollArea className="h-40 border rounded-md border-zinc-200 p-1">
                              <div className="space-y-1">
                                {availableMembers.map(member => (
                                  <div 
                                    key={member.id}
                                    className={`px-3 py-2 rounded-md cursor-pointer flex justify-between items-center ${
                                      selectedMembers.some(m => m.id === member.id) 
                                        ? 'bg-zinc-100' 
                                        : 'hover:bg-zinc-50'
                                    } transition-colors`}
                                    onClick={() => handleMemberSelection(member)}
                                  >
                                    <span className="text-sm text-zinc-900">{member.name}</span>
                                    {selectedMembers.some(m => m.id === member.id) && (
                                      <Badge variant="secondary" className="text-xs bg-zinc-200 text-zinc-700">
                                        {selectedMembers.find(m => m.id === member.id)?.role}
                                      </Badge>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                        
                        {/* Selected members */}
                        <div className="flex-1 min-h-0 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500">Selected Members</Label>
                            <Badge className="bg-black text-white hover:bg-black">
                              {selectedMembers.length}
                            </Badge>
                          </div>
                          
                          {selectedMembers.length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-zinc-400 text-sm border rounded-md border-dashed border-zinc-300">
                              No members selected yet
                            </div>
                          ) : (
                            <ScrollArea className="h-40 border rounded-md border-zinc-200 p-1">
                              <div className="space-y-1">
                                {selectedMembers.map(member => (
                                  <div 
                                    key={member.id}
                                    className="px-3 py-2 rounded-md bg-zinc-50 flex justify-between items-center"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium">{member.name}</span>
                                      <Badge variant="outline" className="text-xs border-zinc-300">
                                        {member.role}
                                      </Badge>
                                    </div>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => removeMember(member.id)}
                                      className="h-6 w-6 p-0 rounded-full hover:bg-zinc-200 hover:text-zinc-700"
                                    >
                                      <X size={12} />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </ScrollArea>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="existing" className="mt-0">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <Building size={18} className="text-zinc-500" />
                      <h2 className="text-base font-medium text-zinc-900">Select Existing Organization</h2>
                    </div>
                    
                    <div className="mb-6">
                      <Select
                        onValueChange={handleOrganizationSelect}
                        value={selectedOrganization?.id}
                      >
                        <SelectTrigger className="bg-zinc-50 border-zinc-200 focus:ring-black focus:border-black">
                          <SelectValue placeholder="Choose an organization" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableOrganizations.map(org => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {selectedOrganization && (
                      <div className="mb-6">
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
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Footer with submit button */}
            <div className="px-6 py-4 mt-auto bg-zinc-50">
              <div className="flex flex-col gap-4">
                {activeTab === 'members' ? (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-zinc-500">New Organization</span>
                      <span className="font-medium">{newOrganizationName || 'Not set'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-500">Members</span>
                      <span className="font-medium">{selectedMembers.length} selected</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-500">Organization</span>
                    <span className="font-medium">{selectedOrganization ? selectedOrganization.name : 'None selected'}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleSubmit}
                  disabled={!isSubmitEnabled}
                  className="w-full bg-black hover:bg-zinc-800 text-white font-medium py-5"
                >
                  {activeTab === 'members' ? 'Create Organization with Members' : 'Use Selected Organization'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default CreateOrg