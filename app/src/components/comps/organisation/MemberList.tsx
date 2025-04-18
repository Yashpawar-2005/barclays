import { User, X, UsersRound } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Label } from "../../ui/label"
import { ScrollArea } from "../../ui/scroll-area"
import { Member } from "./organization"
import { MouseEvent } from 'react'
import Loader from '../../ui/Loader'

interface MemberListProps {
  title: string;
  members: Member[];
  selectedMembers?: Member[];
  onMemberClick?: (member: Member) => void;
  onRemove?: (id: string) => void;
  emptyMessage: string;
  count?: number;
  showRoleBadges?: boolean;
  showRemoveButton?: boolean;
  height?: string; // Optional height prop with default in component
  isLoading?: boolean;
}

const MemberList = ({
  title,
  members,
  selectedMembers = [],
  onMemberClick,
  onRemove,
  emptyMessage,
  count,
  showRoleBadges = false,
  showRemoveButton = false,
  height = "16rem", // Default height of 16rem (256px)
  isLoading = false
}: MemberListProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-1 sm:mb-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</Label>
        {count !== undefined && (
          <Badge className="bg-black text-white hover:bg-black text-xs sm:text-sm px-1.5 sm:px-2">
            {count}
          </Badge>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center flex-1 h-32 border rounded-md border-zinc-200">
          <Loader size="sm" text="Loading members..." />
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 p-4 min-h-[8rem] text-zinc-400 text-xs sm:text-sm border rounded-md border-dashed border-zinc-300">
          <UsersRound size={20} className="text-zinc-300 mb-2" />
          {emptyMessage}
        </div>
      ) : (
        <ScrollArea className="flex-1 border rounded-md border-zinc-200 p-0.5 sm:p-1">
          <div className="space-y-0.5 sm:space-y-1">
            {members.map(member => (
              <div 
                key={member.id}
                className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md flex justify-between items-center ${
                  onMemberClick ? 'cursor-pointer hover:bg-zinc-50' : 'bg-zinc-50'
                } ${
                  selectedMembers?.some(m => m.id === member.id) ? 'bg-zinc-100' : ''
                } transition-colors`}
                onClick={onMemberClick ? () => onMemberClick(member) : undefined}
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-grow">
                  <User size={14} className="text-zinc-500 shrink-0" />
                  <span className="text-xs sm:text-sm font-medium truncate">{member.name}</span>
                  {(showRoleBadges && selectedMembers?.some(m => m.id === member.id)) && (
                    <Badge variant="secondary" className="text-xs bg-zinc-200 text-zinc-700 shrink-0 hidden sm:inline-flex">
                      {selectedMembers.find(m => m.id === member.id)?.role}
                    </Badge>
                  )}
                  {(!showRoleBadges && member.role) && (
                    <Badge variant="outline" className="text-xs border-zinc-300 shrink-0 hidden sm:inline-flex">
                      {member.role}
                    </Badge>
                  )}
                </div>
                {showRemoveButton && onRemove && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e: MouseEvent<HTMLButtonElement>) => {
                      e.stopPropagation();
                      onRemove(member.id);
                    }}
                    className="h-5 w-5 sm:h-6 sm:w-6 p-0 rounded-full hover:bg-zinc-200 hover:text-zinc-700 shrink-0 ml-1"
                  >
                    <X size={10} className="sm:hidden" />
                    <X size={12} className="hidden sm:block" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default MemberList;