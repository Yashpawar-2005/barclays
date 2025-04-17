import React from 'react';
import { Button } from '../ui/button';
import { Plus, Building2,  ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

const OrganizationCreationPanel: React.FC = () => {
  return (
    <div className="flex-1 bg-gradient-to-b from-white to-gray-50 p-4 md:p-8 lg:p-12 min-h-screen flex flex-col">
      <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col justify-between py-6">
        {/* Logo Section */}
        <div className="mb-16">
          <div className="flex items-center">
            {/* Logo placeholder */}
          </div>
        </div>

        {/* Header Section - Left Aligned */}
        <div className="">
          <div className="inline-flex items-center justify-center p-3 bg-gray-100 rounded-full mb-6">
            <Building2 size={34} className="text-black" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black mb-6">Create Your Organization</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl leading-relaxed">
            Set up a dedicated workspace for your team to collaborate on termsheet validation and management
          </p>
        </div>

        {/* Action Section */}
        <Card className="bg-white border-gray-200 shadow-lg overflow-hidden my-16">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row">
              <div className="p-8 md:p-10 flex-1">
                <h2 className="text-2xl font-bold text-black mb-4">Ready to get started?</h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Create your organization in minutes and start inviting team members to collaborate
                </p>
                
                <Button 
                  className="h-14 px-8 flex items-center justify-center gap-3 bg-black hover:bg-gray-800 text-white font-medium text-lg"
                  onClick={() => console.log("Create organization clicked")}
                >
                  <Plus size={20} />
                  <span>Create Organization</span>
                  <ChevronRight size={18} className="ml-1" />
                </Button>
              </div>
              
              <div className="bg-gray-50 p-8 md:p-10 md:w-1/3 flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-200">
                <h3 className="font-medium text-xl text-black mb-3">Need help?</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  Our support team is available to assist you with setting up your organization
                </p>
                <Button 
                  variant="outline" 
                  className="border-gray-300 text-blue-600 hover:bg-gray-50 h-12"
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="text-sm text-gray-500 mt-auto pb-4">
          By creating an organization, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default OrganizationCreationPanel;