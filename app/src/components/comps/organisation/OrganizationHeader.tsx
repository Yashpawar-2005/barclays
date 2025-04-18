import { X } from 'lucide-react'
// import { Button } from '../ui/button'
import { Button } from '../../ui/button';

interface OrganizationHeaderProps {
  onClose: () => void;
}

const OrganizationHeader = ({ onClose }: OrganizationHeaderProps) => {
  return (
    <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 bg-black text-white flex items-center justify-between">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight">Organization Setup</h1>
        <p className="text-zinc-400 mt-0.5 sm:mt-1 text-xs sm:text-sm">Configure members and organization</p>
      </div>
      <Button 
        variant="ghost" 
        className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white shrink-0 ml-2" 
        onClick={onClose}
      >
        <X size={18} className="sm:hidden" />
        <X size={20} className="hidden sm:block" />
      </Button>
    </div>
  );
};

export default OrganizationHeader;