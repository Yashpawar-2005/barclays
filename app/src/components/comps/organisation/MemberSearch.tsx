import { Search } from 'lucide-react'
import { Input } from "../../ui/input"

interface MemberSearchProps {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

const MemberSearch = ({ searchQuery, setSearchQuery }: MemberSearchProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
        <Search size={14} className="text-zinc-400 sm:hidden" />
        <Search size={15} className="text-zinc-400 hidden sm:block" />
      </div>
      <Input
        type="text"
        placeholder="Search for members..."
        className="pl-8 sm:pl-10 bg-zinc-50 border-zinc-200 focus:border-black focus:ring-black text-sm sm:text-base h-9 sm:h-10"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};
export default MemberSearch