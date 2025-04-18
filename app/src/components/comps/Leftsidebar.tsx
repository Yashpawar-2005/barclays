import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Plus, ChevronDown, ChevronRight, Users, Settings, Shield, Menu, X, Building } from 'lucide-react';
import { useUserStore } from '../../services/auth.service';
import { api } from '../../services/axios';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface Organization {
  id: number;
  name: string;
  termsheetname: string;
  role: any;
  users: User[];
}
interface Props {
  createorgtoggle: boolean;
}

const OrganizationSidebar:  React.FC<Props> = ({createorgtoggle}) => {
  const { user } = useUserStore();
  const [adminExpanded, setAdminExpanded] = useState<boolean>(true);
  const [memberExpanded, setMemberExpanded] = useState<boolean>(true);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [adminOrgs, setAdminOrgs] = useState<Organization[]>([]);
  const [memberOrgs, setMemberOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        
        const response = await api('organisation/get_organization');
        const data = response.data;
        
        const adminOrgsList: Organization[] = [];
        const memberOrgsList: Organization[] = [];
        
        data.organisations.forEach((org: Organization) => {
          const currentUser = org.users.find(u => u.email === user?.email);
          
          if (currentUser) {
            if (currentUser.role === 'admin') {
              adminOrgsList.push({
                ...org,
                role: currentUser.role
              });
            } else {
              memberOrgsList.push({
                ...org,
                role: currentUser.role
              });
            }
          }
        });
        
        setAdminOrgs(adminOrgsList);
        setMemberOrgs(memberOrgsList);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError('Failed to load organizations');
        setIsLoading(false);
      }
    };
    
    fetchOrganizations();
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getRoleIcon = (role: string) => {
    switch(role) {
      case 'admin': return <Shield size={16} className="text-blue-500" />;
      case 'editor': return <Settings size={16} className="text-gray-600" />;
      case 'member': return <Users size={16} className="text-gray-600" />;
      default: return <Users size={16} className="text-gray-400" />;
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split('@');
    if (parts.length === 0) return "U";
    const name = parts[0];
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Mobile toggle button */}
      {!sidebarOpen && (
        <div className="md:hidden fixed top-4 left-4 z-40">
          <Button 
            onClick={toggleSidebar} 
            variant="outline" 
            size="icon" 
            className="bg-white shadow-md border-gray-300"
          >
            <Menu size={20} className="text-black" />
          </Button>
        </div>
      )}

      {/* Mobile overlay */}
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
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="font-medium text-black">Organizations</h2>
          <Button 
            onClick={() => setSidebarOpen(false)} 
            variant="ghost" 
            size="icon" 
            className="text-black hover:bg-gray-100"
          >
            <X size={20} />
          </Button>
        </div>
        
        {/* Top Organization Section */}
        <div className="hidden md:flex flex-col items-center justify-center p-6 bg-gray-100 border-b border-gray-200">
          <div className="bg-black rounded-full p-3 mb-3">
            <Building size={24} className="text-white" />
          </div>
          <h1 className="text-lg font-bold text-black">Organizations</h1>
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
        
        {/* Loading State */}
        {isLoading && (
          <div className="px-4 py-6 text-center text-gray-500">
            Loading organizations...
          </div>
        )}
        
        {/* Error State */}
        {error && (
          <div className="px-4 py-6 text-center text-red-500">
            {error}
          </div>
        )}
        
        {/* Admin Organizations Section */}
        {!isLoading && !error && (
          <Collapsible
            open={adminExpanded}
            onOpenChange={setAdminExpanded}
            className="px-4 py-2"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-black hover:text-black cursor-pointer py-2 px-2 rounded hover:bg-gray-100">
              <span>Admin Organizations</span>
              {adminExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-2 space-y-2 mt-2">
              {adminOrgs.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No admin organizations</p>
              ) : (
                adminOrgs.map(org => (
                  <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                    <CardContent className="flex items-center gap-2 p-3 text-sm">
                      <Shield size={16} className="text-blue-500" />
                      <span className="text-black font-medium truncate">{org.name}</span>
                    </CardContent>
                  </Card>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Member Organizations Section */}
        {!isLoading && !error && (
          <Collapsible
            open={memberExpanded}
            onOpenChange={setMemberExpanded}
            className="px-4 py-2"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-black hover:text-black cursor-pointer py-2 px-2 rounded hover:bg-gray-100">
              <span>Member Organizations</span>
              {memberExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </CollapsibleTrigger>
            
            <CollapsibleContent className="pl-2 space-y-2 mt-2">
              {memberOrgs.length === 0 ? (
                <p className="text-sm text-gray-500 p-2">No member organizations</p>
              ) : (
                memberOrgs.map(org => (
                  <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                    <CardContent className="flex items-center gap-2 p-3 text-sm">
                      {getRoleIcon(org.role)}
                      <span className="text-black font-medium truncate">{org.name}</span>
                      <span className="ml-auto text-xs text-blue-500 capitalize">{org.role}</span>
                    </CardContent>
                  </Card>
                ))
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Bottom spacer */}
        <div className="flex-grow"></div>
        
        {/* Footer with user info */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <span className="text-xs text-white font-medium">{getUserInitials()}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-black">{user?.email?.split('@')[0]}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationSidebar;