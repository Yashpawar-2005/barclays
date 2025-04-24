// src/pages/Mainpages/UploadingTermsheet.tsx

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import { api } from "../../services/axios";

export default function UploadingTermsheet() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [orderId, setOrderId] = useState("");
  const [termsheetName, setTermsheetName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!email || !orderId || !termsheetName) {
      setError("All fields are required");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const { data } = await api.post("/file/upload_from_email", {
        email,
        orderId,
        termsheetName,
        id: orgId,  // matches your controller’s `id: orgIdRaw`
      });

      console.log("Created termsheet via email:", data.termsheet);
      navigate(`/admin/${orgId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-start p-8 bg-gray-50 min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload Termsheet from Email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-red-600">{error}</p>}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Order ID</label>
            <Input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="e.g. 12345"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Termsheet Name</label>
            <Input
              type="text"
              value={termsheetName}
              onChange={(e) => setTermsheetName(e.target.value)}
              placeholder="Your Term Sheet Title"
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black text-white"
            >
              {loading ? "Uploading…" : "Fetch & Upload"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
