import { User, X } from 'lucide-react'
import { Button } from '../../ui/button'
import { Badge } from '../../ui/badge'
import { Label } from "../../ui/label"
import { ScrollArea } from "../../ui/scroll-area"
import { Member } from "./organization"
import { MouseEvent } from 'react'

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
  height = "16rem" // Default height of 16rem (256px)
}: MemberListProps) => {
  return (
    <div className="flex flex-col" style={{ height }}>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-zinc-500">{title}</Label>
        {count !== undefined && (
          <Badge className="bg-black text-white hover:bg-black">
            {count}
          </Badge>
        )}
      </div>
      
      {members.length === 0 ? (
        <div className="flex items-center justify-center h-full text-zinc-400 text-sm border rounded-md border-dashed border-zinc-300">
          {emptyMessage}
        </div>
      ) : (
        <ScrollArea className="h-full border rounded-md border-zinc-200 p-1">
          <div className="space-y-1">
            {members.map(member => (
              <div 
                key={member.id}
                className={`px-3 py-2 rounded-md flex justify-between items-center ${
                  onMemberClick ? 'cursor-pointer hover:bg-zinc-50' : 'bg-zinc-50'
                } ${
                  selectedMembers?.some(m => m.id === member.id) ? 'bg-zinc-100' : ''
                } transition-colors`}
                onClick={onMemberClick ? () => onMemberClick(member) : undefined}
              >
                <div className="flex items-center gap-2">
                  <User size={14} className="text-zinc-500" />
                  <span className="text-sm font-medium">{member.name}</span>
                  {(showRoleBadges && selectedMembers?.some(m => m.id === member.id)) && (
                    <Badge variant="secondary" className="text-xs bg-zinc-200 text-zinc-700">
                      {selectedMembers.find(m => m.id === member.id)?.role}
                    </Badge>
                  )}
                  {(!showRoleBadges && member.role) && (
                    <Badge variant="outline" className="text-xs border-zinc-300">
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
                    className="h-6 w-6 p-0 rounded-full hover:bg-zinc-200 hover:text-zinc-700"
                  >
                    <X size={12} />
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