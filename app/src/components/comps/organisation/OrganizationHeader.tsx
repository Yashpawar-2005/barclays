import { X } from 'lucide-react'
// import { Button } from '../ui/button'
import { Button } from '../../ui/button';

interface OrganizationHeaderProps {
  onClose: () => void;
}

const OrganizationHeader = ({ onClose }: OrganizationHeaderProps) => {
  return (
    <div className="px-8 py-6 bg-black text-white flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Organization Setup</h1>
        <p className="text-zinc-400 mt-1 text-sm">Configure members and organization</p>
      </div>
      <Button 
        variant="ghost" 
        className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white" 
        onClick={onClose}
      >
        <X size={20} />
      </Button>
    </div>
  );
};

export default OrganizationHeader;