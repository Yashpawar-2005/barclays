import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Plus, ChevronDown, ChevronRight, Users, Settings, Shield, Menu, X, Building } from 'lucide-react';
import { useUserStore } from '../../services/auth.service';

interface Organization {
  id: number;
  name: string;
  role: string;
}

const OrganizationSidebar: React.FC = () => {
  const {user} = useUserStore();
  const [adminExpanded, setAdminExpanded] = React.useState<boolean>(true);
  const [memberExpanded, setMemberExpanded] = React.useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(false);
  
  // Sample data - in a real app this would come from your backend
  const adminOrgs: Organization[] = [
    { id: 1, name: "Acme Corp", role: "admin" },
    { id: 2, name: "Startup Labs", role: "admin" }
  ];
  
  const memberOrgs: Organization[] = [
    { id: 3, name: "Tech Innovators", role: "member" },
    { id: 4, name: "Design Collective", role: "editor" },
    { id: 5, name: "Marketing Team", role: "viewer" }
  ];
  
  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield size={16} className="text-blue-500" />;
      case 'editor': return <Settings size={16} className="text-blue-400" />;
      case 'member': return <Users size={16} className="text-blue-400" />;
      default: return <Users size={16} className="text-gray-400" />;
    }
  };

  React.useEffect(() => {
    // Close sidebar when screen size increases
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Get user initials
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split('@');
    if (parts.length === 0) return "U";
    const name = parts[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile toggle button - only visible on smaller screens when sidebar is closed */}
      {!sidebarOpen && (
        <div className="md:hidden fixed top-4 left-4 z-40">
          <Button 
            onClick={toggleSidebar} 
            variant="outline" 
            size="icon" 
            className="bg-white shadow-md border-gray-300"
          >
            <Menu size={20} className="text-gray-800" />
          </Button>
        </div>
      )}

      {/* Overlay to close sidebar when clicking outside (mobile only) */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:relative z-30 
        w-64 md:w-72 lg:w-80 h-screen
        bg-white border-r border-gray-200 flex flex-col
        transition-transform duration-300 ease-in-out
        shadow-lg md:shadow-md
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header with close button - only visible on mobile */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-medium text-gray-800">Organizations</h2>
          <Button 
            onClick={() => setSidebarOpen(false)} 
            variant="ghost" 
            size="icon" 
            className="text-gray-600 hover:bg-gray-100"
          >
            <X size={20} />
          </Button>
        </div>
        
        {/* Top Organization Section - Branding */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="bg-blue-600 rounded-full p-3 mb-3">
            <Building size={24} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Organizations</h1>
          <p className="text-xs text-gray-600 mt-1 text-center">
            Manage your organization workspaces
          </p>
        </div>
        
        {/* Create Organization Button */}
        <div className="p-4">
          <Button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2">
            <Plus size={16} />
            <span>Create Organization</span>
          </Button>
        </div>
        
        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gray-200"></div>
        </div>
        
        {/* Admin Organizations Section */}
        <Collapsible
          open={adminExpanded}
          onOpenChange={setAdminExpanded}
          className="px-4 py-2"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-black cursor-pointer py-2 px-2 rounded hover:bg-gray-100">
            <span>Admin Organizations</span>
            {adminExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pl-2 space-y-2 mt-2">
            {adminOrgs.map(org => (
              <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                <CardContent className="flex items-center gap-2 p-3 text-sm">
                  {getRoleIcon(org.role)}
                  <span className="text-gray-900 font-medium truncate">{org.name}</span>
                </CardContent>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Member Organizations Section */}
        <Collapsible
          open={memberExpanded}
          onOpenChange={setMemberExpanded}
          className="px-4 py-2"
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-gray-800 hover:text-black cursor-pointer py-2 px-2 rounded hover:bg-gray-100">
            <span>Member Organizations</span>
            {memberExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </CollapsibleTrigger>
          
          <CollapsibleContent className="pl-2 space-y-2 mt-2">
            {memberOrgs.map(org => (
              <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                <CardContent className="flex items-center gap-2 p-3 text-sm">
                  {getRoleIcon(org.role)}
                  <span className="text-gray-900 font-medium truncate">{org.name}</span>
                  <span className="ml-auto text-xs text-blue-500 capitalize">{org.role}</span>
                </CardContent>
              </Card>
            ))}
          </CollapsibleContent>
        </Collapsible>
        
        {/* Bottom spacer for full screen */}
        <div className="flex-grow"></div>
        
        {/* Footer with user info */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-xs text-gray-700 font-medium">{getUserInitials()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationSidebar;