import React from 'react'
import TeamSummary from './TeamSummary'
import { Link } from 'react-router-dom'

const ProjectList = ({match_forms}) => {
  return (
    <div className="project-list section">
      { match_forms && match_forms.map(match_form => {
        return (
          <Link to={'/match_form/' + match_form.id} key={match_form.id}>
            <TeamSummary match_form={match_form} />
          </Link>
        )
      })}  
    </div>
  )
}

export default ProjectList
