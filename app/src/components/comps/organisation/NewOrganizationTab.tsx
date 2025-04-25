import { useState } from 'react'
import { Label } from "../../ui/label"
import { Input } from "../../ui/input"
import { Member } from "./organization"
import MemberAssignment from './MemberAssignment'
import MemberSearch from './MemberSearch'
import MemberList from './MemberList'
import Loader from '../../ui/Loader'

interface NewOrganizationTabProps {
  availableMembers: Member[];
  selectedMembers: Member[];
  setSelectedMembers: React.Dispatch<React.SetStateAction<Member[]>>;
  organizationName: string;
  setOrganizationName: React.Dispatch<React.SetStateAction<string>>;
}

const NewOrganizationTab = ({
  availableMembers,
  selectedMembers,
  setSelectedMembers,
  organizationName,
  setOrganizationName
}: NewOrganizationTabProps) => {
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [currentMember, setCurrentMember] = useState<Member | null>(null)
  const [tempRole, setTempRole] = useState<string>('')
  
  const isLoading = availableMembers.length === 0;
  
  // Client-side filtering of members based on search query
  const filteredMembers = availableMembers.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
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
  
  return (
    <div className="flex flex-col space-y-4 sm:space-y-5 overflow-y-auto h-full pb-4">
      <div>
        <Label htmlFor="new-org-name" className="text-xs font-medium uppercase tracking-wide text-zinc-500 block mb-1.5">
          Organization Name
        </Label>
        <Input
          id="new-org-name"
          placeholder="Enter organization name"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          className="bg-zinc-50 border-zinc-200 focus:ring-black focus:border-black text-sm sm:text-base"
        />
      </div>
      
      <MemberSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      {currentMember && (
        <MemberAssignment 
          member={currentMember}
          tempRole={tempRole}
          setTempRole={setTempRole}
          onAssign={assignRole}
          onCancel={() => setCurrentMember(null)}
        />
      )}
      
      {isLoading ? (
        <div className="my-8">
          <Loader text="Loading members..." />
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 flex-1 min-h-0">
        <MemberList 
          title="Available Members"
          members={filteredMembers}
          selectedMembers={selectedMembers}
          onMemberClick={handleMemberSelection}
          emptyMessage="No members found"
          showRoleBadges
          height="auto"
            isLoading={isLoading}
        />
        
        <MemberList 
          title="Selected Members"
          members={selectedMembers}
          onRemove={removeMember}
          emptyMessage="No members selected yet"
          count={selectedMembers.length}
          showRemoveButton
          height="auto"
        />
      </div>
      )}
    </div>
  );
};

export default NewOrganizationTab;