import React, { useEffect, useState } from 'react';
import { Button } from '../../ui/button';
import { Card, CardContent } from '../../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../../ui/collapsible';
import { Plus, ChevronDown, ChevronRight, Users, Settings, Shield, Menu, X, Building, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../../services/auth.service';
import { api } from '../../../services/axios';
import { useNavigate } from 'react-router-dom';

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


const OrganizationSidebar = () => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();
  const [adminExpanded, setAdminExpanded] = useState<boolean>(false);
  const [memberExpanded, setMemberExpanded] = useState<boolean>(false);
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

 

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split('@');
    if (parts.length === 0) return "U";
    const name = user.name;
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <>
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
          <div className="w-full flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium py-2">
            <Plus size={16} />
            <span>Create Organization</span>
          </div>
        </div>
        
        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px bg-gray-200"></div>
        </div>
        
        {/* Organizations container with adaptive height */}
        <div className="flex-1 min-h-0 flex flex-col">
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
              
              <CollapsibleContent className={`pl-2 space-y-1.5 mt-2 pr-2 overflow-y-auto ${adminExpanded && memberExpanded ? 'max-h-[20vh]' : 'max-h-[35vh]'}`}>
                {adminOrgs.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No admin organizations</p>
                ) : (
                  adminOrgs.map(org => (
                    <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                      <Link to={`/org/${org.id}`}>
                      <CardContent className="flex flex-col py-1.5 px-3 text-sm">
                        <span className="text-black font-medium truncate">{org.name}</span>
                        <div className="flex items-center gap-1 text-xs text-blue-500">
                          <Shield size={12} />
                          <span>Admin</span>
                        </div>
                      </CardContent>
                      </Link>
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
              
              <CollapsibleContent className={`pl-2 space-y-1.5 mt-2 pr-2 overflow-y-auto ${adminExpanded && memberExpanded ? 'max-h-[20vh]' : 'max-h-[35vh]'}`}>
                {memberOrgs.length === 0 ? (
                  <p className="text-sm text-gray-500 p-2">No member organizations</p>
                ) : (
                  memberOrgs.map(org => (
                    <Card key={org.id} className="bg-gray-50 hover:bg-gray-100 border-gray-200 cursor-pointer transition-colors">
                      <Link to={`/org/${org.id}`}>
                     <CardContent className="flex flex-col py-1.5 px-3 text-sm">
                        <span className="text-black font-medium truncate">{org.name}</span>
                        <div className="flex items-center gap-1 text-xs text-blue-500">
                          {org.role === 'editor' ? <Settings size={12} /> : <Users size={12} />}
                          <span className="capitalize">{org.role}</span>
                        </div>
                      </CardContent>
                      </Link>
                    </Card>
                  ))
                )}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>
        
        {/* Footer with user info */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
                <span className="text-xs text-white font-medium">{getUserInitials()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-black">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>
            <Button 
              onClick={handleLogout}
              variant="ghost" 
              size="icon"
              className="text-black-600 hover:text-red-700 hover:bg-red-50 transition-colors relative group"
              title="Logout"
            >
              <LogOut size={16} />
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Logout
              </span>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizationSidebar;