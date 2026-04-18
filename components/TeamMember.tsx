import Image from 'next/image'

interface TeamMemberProps {
  name: string
  role: string
  bio: string
  avatar: string
  color: string
}

export default function TeamMember({ name, role, bio, avatar, color }: TeamMemberProps) {
  return (
    <div className="group text-center">
      <div className="relative w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[var(--glow-color)] transition-all duration-300" style={{ '--glow-color': color } as React.CSSProperties}>
        <Image
          src={avatar}
          alt={name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">{name}</h3>
      <p className="text-sm font-medium mb-2" style={{ color }}>{role}</p>
      <p className="text-gray-500 text-sm leading-relaxed max-w-xs mx-auto">{bio}</p>
    </div>
  )
}
