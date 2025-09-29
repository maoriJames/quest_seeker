// import React, { ImgHTMLAttributes, useEffect, useState } from "react"
// import { supabase } from "../lib/supabase"

// type RemoteImageProps = {
//   path?: string | null
//   fallback: string
// } & Omit<ImgHTMLAttributes<HTMLImageElement>, "src">

// const RemoteImage = ({ path, fallback, ...imgProps }: RemoteImageProps) => {
//   const [image, setImage] = useState<string>("")

//   useEffect(() => {
//     if (!path) return
//     ;(async () => {
//       setImage("")
//       const { data, error } = await supabase.storage
//         .from("profile-images")
//         .download(path)

//       if (error) {
//         console.error("Error downloading image:", error)
//         return
//       }

//       if (data) {
//         const fr = new FileReader()
//         fr.readAsDataURL(data)
//         fr.onload = () => {
//           setImage(fr.result as string)
//         }
//       }
//     })()
//   }, [path])

//   return (
//     <img
//       src={image || fallback}
//       alt={imgProps.alt ?? "remote image"}
//       {...imgProps}
//     />
//   )
// }

// export default RemoteImage
