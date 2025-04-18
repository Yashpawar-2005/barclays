import { User, X, Check } from 'lucide-react'
import { Button } from '../../ui/button'
import { Input } from "../../ui/input"
import { Separator } from "../../ui/separator"
import { Member } from "./organization"

interface MemberAssignmentProps {
  member: Member;
  tempRole: string;
  setTempRole: React.Dispatch<React.SetStateAction<string>>;
  onAssign: () => void;
  onCancel: () => void;
}

const MemberAssignment = ({
  member,
  tempRole,
  setTempRole,
  onAssign,
  onCancel
}: MemberAssignmentProps) => {
  return (
    <div className="p-3 sm:p-4 rounded-lg bg-zinc-50 border border-zinc-200 flex flex-col gap-2 sm:gap-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 min-w-0">
          <User size={16} className="text-zinc-500 shrink-0" />
          <span className="font-medium text-zinc-900 text-sm sm:text-base truncate">{member.name}</span>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onCancel}
          className="h-6 w-6 sm:h-7 sm:w-7 p-0 rounded-full hover:bg-zinc-200 ml-1 shrink-0"
        >
          <X size={14} />
        </Button>
      </div>
      <Separator className="bg-zinc-200" />
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Input
          placeholder="Enter role (e.g. Admin, Member)"
          value={tempRole}
          onChange={(e) => setTempRole(e.target.value)}
          className="flex-1 bg-white border-zinc-200 text-sm sm:text-base"
        />
        <Button 
          onClick={onAssign} 
          disabled={!tempRole}
          className="bg-black text-white hover:bg-zinc-800 text-xs sm:text-sm py-1 sm:py-2"
        >
          <Check size={14} className="mr-1 shrink-0" />
          Assign
        </Button>
      </div>
    </div>
  );
};

export default MemberAssignment;