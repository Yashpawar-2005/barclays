import React from 'react';
import { Button } from '../ui/button';
import { Plus, Building2, Users, ChevronRight, Shield, ActivitySquare } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
interface Props {
  createorgtoggle: boolean;
  setorgtoggle:  React.Dispatch<React.SetStateAction<boolean>>
}
const SecondOrganisationcreation:  React.FC<Props> = ({setorgtoggle}) => {
  return (
    <div className="flex-1 bg-gradient-to-b from-white to-gray-50 p-4 md:p-8 lg:p-12 h-screen overflow-x-hidden overflow-y-scroll ">
      <div className="w-full max-w-6xl mx-auto">
        {/* Logo Section */}
        <div className="">
          <div className="flex items-center">
            {/* Logo with image placeholder */}
            {/* <div className="h-12 w-48  rounded flex items-center justify-center text-white font-bold overflow-hidden">
              <img src='../../../public/images/logo.jpg' alt="Company Logo" className="h-full w-full object-contain" />
            </div> */}
          </div>
        </div>

        {/* Header Section */}
        <div className="">
          <div className="inline-flex items-center justify-center p-2 bg-gray-100 rounded-full mb-4">
            <Building2 size={28} className="text-black" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-3">Create Your Organization</h1>
          <p className="text-md md:text-lg text-gray-600 max-w-2xl">
            Set up a dedicated workspace for your team to collaborate on termsheet validation and management
          </p>
        </div>

        {/* Benefits Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <div className="bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full mb-4">
                <Users size={20} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Team Collaboration</h3>
              <p className="text-gray-600 text-sm">Invite team members and assign roles to streamline your workflow</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <div className="bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full mb-4">
                <Shield size={20} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Secure Environment</h3>
              <p className="text-gray-600 text-sm">All your data is encrypted and stored securely in our platform</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 shadow-sm hover:shadow transition-shadow">
            <CardContent className="p-6">
              <div className="bg-gray-100 w-10 h-10 flex items-center justify-center rounded-full mb-4">
                <ActivitySquare size={20} className="text-black" />
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">Analytics & Insights</h3>
              <p className="text-gray-600 text-sm">Get valuable insights and reporting on your termsheet processes</p>
            </CardContent>
          </Card>
        </div>
        <Card className="bg-white border-gray-200 shadow-md overflow-hidden">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-8 flex-1">
                <h2 className="text-xl font-bold text-black mb-3">Ready to get started?</h2>
                <p className="text-gray-600 mb-6">
                  Create your organization in minutes and start inviting team members to collaborate
                </p>
                
                <Button 
                  className="h-12 px-6 flex items-center justify-center gap-2 bg-black hover:bg-gray-800 text-white font-medium"
                  onClick={() => {console.log("woringking");setorgtoggle(prev => !prev)}}
                >
                  <Plus size={18} />
                  <span>Create Organization</span>
                  <ChevronRight size={16} className="ml-1" />
                </Button>
              </div>
              
              <div className="bg-gray-50 p-6 md:p-8 md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-200">
                <h3 className="font-medium text-black mb-2">Need help?</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is available to assist you with setting up your organization
                </p>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-blue-600 hover:bg-gray-50"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-sm text-gray-500 mt-8">
          By creating an organization, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default SecondOrganisationcreation;