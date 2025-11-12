// client/src/components/Loading.jsx
'use client'

import LoadingState from './LoadingState'

// Legacy wrapper to preserve backwards compatibility
export default function Loading(props) {
  return <LoadingState {...props} />
}