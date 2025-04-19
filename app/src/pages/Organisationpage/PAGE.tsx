import OrganizationSidebar from "../../components/comps/Sidebars.tsx/Leftsidebar2"
import TermsheetPage from "./Structurization&Validation"

const PAGE = () => {
  return (
    <div className="flex flex-row">
        {/* <div> */}

    <OrganizationSidebar/>
        
        <div className="flex-1">

    <TermsheetPage/>
        </div>
        
    </div>
  )
}

export default PAGE