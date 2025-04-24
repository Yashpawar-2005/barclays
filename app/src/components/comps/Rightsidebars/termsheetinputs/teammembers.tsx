import { Avatar, AvatarFallback, AvatarImage } from "../../../ui/avatar"
import { Users } from "lucide-react"
import { Badge } from "../../../ui/badge"
import { useParams } from "react-router-dom"
import { ScrollArea } from "../../../ui/scroll-area"
import { useEffect } from "react"
import { api } from "../../../../services/axios"
import React from "react"

type Member = {
  id: string
  name: string
  role: string
  avatar?: string
  email?: string
}

interface TeamMemberSidebarProps {
  members: Member[]
  setmembers: React.Dispatch<React.SetStateAction<Member[]>>
}

interface MemberItemProps {
  member: Member
}

export const TeamMemberSidebar: React.FC<TeamMemberSidebarProps> = ({ members, setmembers }) => {
  const { orgId:id } = useParams()

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await api.get(`/organisation/get_members/${id}`)
        const users = res.data?.users ?? []

        const mappedMembers: Member[] = users.map((user: any) => ({
          id: user.userId.toString(),
          name: user.name,
          role: user.role,
          avatar: "", // replace with user.avatar if available
          email: user.email,
        }))

        setmembers(mappedMembers)
      } catch (err) {
        console.error("Failed to fetch members", err)
      }
    }

    fetchMembers()
  }, [id, setmembers])

  const MemberItem: React.FC<MemberItemProps> = ({ member }) => (
    <div className="flex items-center p-3 rounded-md hover:bg-slate-100 transition-colors">
      <div className="relative">
        <Avatar className="h-10 w-10 border border-slate-200">
          <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
          <AvatarFallback className="bg-slate-200 text-slate-600">
            {member.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white bg-green-500" />
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-slate-800">{member.name}</p>
        <p className="text-xs text-slate-500">{member.role}</p>
        {member.email && (
          <p className="text-xs text-slate-400 italic">{member.email}</p>
        )}
      </div>
    </div>
  )

  return (
    <div className="w-80 border-l border-slate-200 bg-white flex flex-col shadow-inner">
      <div className="p-5 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-800 flex items-center">
            <Users className="h-4 w-4 mr-2 text-slate-500" />
            Team Members
          </h3>
          <Badge variant="outline" className="text-xs border-slate-300">
            {members.length}
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          <div className="space-y-2">
            {members.map((member) => (
              <MemberItem key={member.id} member={member} />
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
