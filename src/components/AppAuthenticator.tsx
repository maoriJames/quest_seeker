// import { ReactNode, useState } from 'react'
// import { Authenticator } from '@aws-amplify/ui-react'
// import { generateClient } from 'aws-amplify/api'
// import { createProfile } from '@/graphql/mutations'

// const client = generateClient()

// type AppAuthenticatorProps = {
//   children: ReactNode
// }

// export default function AppAuthenticator({ children }: AppAuthenticatorProps) {
//   const [role, setRole] = useState<'user' | 'creator'>('user')

//   const handleSubmitProfile = async (userEmail: string) => {
//     await client.graphql({
//       query: createProfile,
//       variables: {
//         input: {
//           id: userEmail,
//           role,
//         },
//       },
//       authMode: 'userPool',
//     })
//   }

//   return (
//     <Authenticator>
//       {({ signOut, user }) => (
//         <div>
//           {/* Your role selection / signup form */}
//           <select
//             value={role}
//             onChange={(e) => setRole(e.target.value as 'user' | 'creator')}
//           >
//             <option value="user">User</option>
//             <option value="creator">Creator</option>
//           </select>
//           <button onClick={() => handleSubmitProfile(user.getUsername())}>
//             Complete Signup
//           </button>

//           {/* Render children components after authentication */}
//           {children}
//         </div>
//       )}
//     </Authenticator>
//   )
// }
