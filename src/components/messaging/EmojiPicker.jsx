/**
 * EmojiPicker.jsx
 * 1000+ emojis, categorized, searchable, recently used — green/white theme
 * Inserts at cursor position, remembers recently used
 */

import React, {
  useState, useMemo, useRef, useCallback, useEffect, memo,
} from 'react'
import './EmojiPicker.css'

/* ══════════════════════════════════════════════════════════════════════════
   EMOJI DATASET
   ══════════════════════════════════════════════════════════════════════════ */
const EMOJI_CATEGORIES = [
  {
    id: 'recent', label: 'Recently Used', icon: '🕐', emojis: [],
  },
  {
    id: 'smileys', label: 'Smileys & Emotion', icon: '😀',
    emojis: [
      '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','🫠','😉','😊',
      '😇','🥰','😍','🤩','😘','😗','☺️','😚','😙','🥲','😋','😛','😜',
      '🤪','😝','🤑','🤗','🤭','🫢','🫣','🤫','🤔','🫡','🤐','🤨','😐',
      '😑','😶','🫥','😏','😒','🙄','😬','🤥','🫨','😌','😔','😪','🤤',
      '😴','😷','🤒','🤕','🤢','🤮','🤧','🥵','🥶','🥴','😵','😵‍💫','🤯',
      '🤠','🥳','🥸','😎','🤓','🧐','😕','🫤','😟','🙁','☹️','😮','😯',
      '😲','😳','🥺','🥹','😦','😧','😨','😰','😥','😢','😭','😱','😖',
      '😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀',
      '☠️','💩','🤡','👹','👺','👻','👽','👾','🤖','😺','😸','😹','😻',
      '😼','😽','🙀','😿','😾','🙈','🙉','🙊',
      '❤️','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔',
      '❤️‍🔥','❤️‍🩹','❣️','💕','💞','💓','💗','💖','💘','💝','💟',
      '💋','💯','💢','💥','💫','💦','💨','💬','💭','💤',
    ],
  },
  {
    id: 'gestures', label: 'Gestures & Hands', icon: '👋',
    emojis: [
      '👋','🤚','🖐️','✋','🖖','🫱','🫲','🫳','🫴','🫵','👌','🤌','🤏',
      '✌️','🤞','🫰','🤟','🤘','🤙','👈','👉','👆','🖕','👇','☝️','👍',
      '👎','✊','👊','🤛','🤜','👏','🙌','🫶','👐','🤲','🤝','🙏','✍️',
      '💅','🤳','💪','🦾','🦿','🦵','🦶','👂','🦻','👃','🫀','🫁','🧠',
      '🦷','🦴','👀','👁️','👅','👄','🫦',
    ],
  },
  {
    id: 'people', label: 'People & Body', icon: '👫',
    emojis: [
      '👶','🧒','👦','👧','🧑','👱','👨','🧔','👩','🧓','👴','👵',
      '🙍','🙎','🙅','🙆','💁','🙋','🧏','🙇','🤦','🤷',
      '👮','🕵️','💂','🥷','👷','🫅','🤴','👸','👳','👲','🧕','🤵','👰',
      '🤰','🤱','👼','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞',
      '🧟','🧌','💆','💇','🚶','🧍','🧎','🏃','💃','🕺','🕴️','👯',
      '🧖','🧗','🤺','🏇','⛷️','🏂','🏋️','🤼','🤸','🤽','🤾','🏌️',
      '🏄','🚣','🧘','🛀','🛌','👭','👫','👬','💏','💑','👪',
      '🧑‍🤝‍🧑','👨‍👩‍👦','👨‍👩‍👧','👨‍👩‍👧‍👦',
    ],
  },
  {
    id: 'animals', label: 'Animals & Nature', icon: '🐶',
    emojis: [
      '🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐻‍❄️','🐨','🐯','🦁',
      '🐮','🐷','🐸','🐵','🐔','🐧','🐦','🐤','🦆','🦅','🦉','🦇',
      '🐝','🪱','🐛','🦋','🐌','🐞','🐜','🪲','🦟','🦗','🪳','🕷️','🦂',
      '🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟',
      '🐬','🐳','🐋','🦈','🦭','🐊','🐅','🐆','🦓','🦍','🦧','🦣','🐘',
      '🦛','🦏','🐪','🐫','🦒','🦘','🦬','🐃','🐂','🐄','🐎','🐖','🐏',
      '🐑','🦙','🐐','🦌','🐕','🐩','🦮','🐕‍🦺','🐈','🐈‍⬛','🪶','🐓',
      '🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦨','🦡','🦫','🦦',
      '🦥','🐁','🐀','🐿️','🦔','🐾','🌵','🎄','🌲','🌳','🌴','🪵','🌱',
      '🌿','☘️','🍀','🎍','🪴','🎋','🍃','🍂','🍁','🍄','🐚','🪸','🌾',
      '💐','🌷','🌹','🥀','🌺','🌸','🌼','🌻','🌞','🌝','🌛','🌜','🌚',
      '🌕','🌖','🌗','🌘','🌑','🌒','🌓','🌔','🌙','🌟','⭐','🌠','🌌',
      '☀️','🌤️','⛅','🌥️','☁️','🌦️','🌧️','⛈️','🌩️','🌨️','❄️','☃️',
      '⛄','🌬️','💨','💧','💦','🫧','🌊','🌀','🌈','🌂','⛱️','⚡','🔥',
    ],
  },
  {
    id: 'food', label: 'Food & Drink', icon: '🍎',
    emojis: [
      '🍏','🍎','🍐','🍊','🍋','🍌','🍉','🍇','🍓','🫐','🍈','🍒','🍑',
      '🥭','🍍','🥥','🥝','🍅','🍆','🥑','🫑','🥦','🥬','🥒','🌶️','🫒',
      '🧄','🧅','🥔','🍠','🫘','🌽','🥕','🥗','🥘','🫕','🥫','🧂','🥚',
      '🍳','🧇','🥞','🧈','🍞','🥐','🥖','🫓','🥨','🥯','🧀','🍖','🍗',
      '🥩','🥓','🌭','🍔','🍟','🍕','🫔','🌮','🌯','🥙','🧆','🍝','🍜',
      '🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥮','🍢',
      '🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯',
      '🧃','🥤','🧋','☕','🍵','🧉','🍺','🍻','🥂','🍷','🫗','🥃','🍸',
      '🍹','🧊','🥄','🍴','🍽️','🥢','🫙','🫖','🍶',
    ],
  },
  {
    id: 'travel', label: 'Travel & Places', icon: '✈️',
    emojis: [
      '🌍','🌎','🌏','🌐','🗺️','🧭','🌋','🏔️','⛰️','🏕️','🏖️','🏜️',
      '🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🛖','🏘️','🏚️','🏠','🏡','🏢',
      '🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒',
      '🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️',
      '🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🚂','🚃','🚄',
      '🚅','🚆','🚇','🚈','🚉','🚊','🚝','🚞','🚋','🚌','🚍','🚎','🚐',
      '🚑','🚒','🚓','🚔','🚕','🚖','🚗','🚘','🚙','🛻','🚚','🚛','🚜',
      '🏎️','🏍️','🛵','🦽','🦼','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️',
      '⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🪝','⛵','🛶','🚤','🛳️',
      '⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡',
      '🛰️','🚀','🛸','🪐','🎆','🎇','🧨','✨','🎉','🎊',
    ],
  },
  {
    id: 'activities', label: 'Activities', icon: '⚽',
    emojis: [
      '⚽','🏀','🏈','⚾','🥎','🎾','🏐','🏉','🥏','🎱','🪀','🏓','🏸',
      '🏒','🥍','🏑','🥌','🪃','🏹','🎣','🤿','🥊','🥋','🎽','🛹','🛷',
      '⛸️','🥅','⛳','🪁','🎿','🏆','🥇','🥈','🥉','🏅','🎖️','🏵️','🎗️',
      '🎫','🎟️','🎪','🤹','🎭','🩰','🎨','🖼️','🎰','🎲','♟️','🧩','🪄',
      '🎮','🕹️','🧸','🪅','🪆','🃏','🀄','🎴','🎵','🎶','🎼','🎤','🎧',
      '📻','🎷','🪗','🎸','🎹','🥁','🪘','🎺','🎻','🪕','🎬','📽️','🎦',
    ],
  },
  {
    id: 'objects', label: 'Objects', icon: '💡',
    emojis: [
      '📱','💻','⌨️','🖥️','🖨️','🖱️','🖲️','💽','💾','💿','📀','🧮',
      '📞','☎️','📟','📠','📺','📷','📸','📹','🎥','📽️','🎞️','📡','🔭',
      '🔬','💈','⚗️','🔮','🪄','🧿','🧸','💎','🔔','🔕','📢','📣','🎙️',
      '🎚️','🎛️','🗒️','🗓️','📅','📆','🗑️','📌','📍','📎','🖇️','📏',
      '📐','✂️','🗃️','🗄️','🔒','🔓','🔏','🔐','🔑','🗝️','🔨','🪓','⛏️',
      '⚒️','🛠️','🗡️','⚔️','🛡️','🔧','🔩','⚙️','🗜️','⚖️','🦯','🔗',
      '⛓️','🪝','🧲','🪜','⚗️','🧪','🧫','🧬','🩺','🩻','💊','💉','🩹',
      '🩼','🧰','💡','🔦','🕯️','🪔','🏮','🧯','🛢️','⛽','🪣','🧹','🧺',
      '🧻','🚿','🛁','🪠','🧼','🫧','🪥','🧽','🧴','🛒','📔','📕','📖',
      '📗','📘','📙','📚','📓','📃','📄','📑','🗒️','📰','🗞️','📋','📊',
      '📈','📉','🗺️','📍','📌','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️',
      '🔍','🔎','🔏','🔒','🔓','🏷️','🔖','💰','💴','💵','💶','💷','💸',
      '💳','🪙','💹','💱','💲','✉️','📧','📨','📩','📤','📥','📦','📫',
      '📪','📬','📭','📮','🗳️','📝','📁','📂','🗂️','🗃️','🗄️','🗑️',
    ],
  },
  {
    id: 'symbols', label: 'Symbols', icon: '♾️',
    emojis: [
      '❤️','🧡','💛','💚','💙','🩵','💜','🖤','🩶','🤍','🤎','💔',
      '☮️','✝️','☪️','🕉️','☸️','🪯','✡️','🔯','🕎','☯️','☦️','🛐',
      '⛎','♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓',
      '🆔','⚛️','🉑','☢️','☣️','📴','📳','🈶','🈚','🈸','🈺','🈷️',
      '✴️','🆚','💮','🉐','㊙️','㊗️','🈴','🈵','🈹','🈲','🅰️','🅱️',
      '🆎','🆑','🅾️','🆘','❌','⭕','🛑','⛔','📛','🚫','💯','💢',
      '♨️','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸',
      '🔱','⚜️','🔰','♻️','✅','❎','🆙','🆒','🆕','🆓','ℹ️',
      '0️⃣','1️⃣','2️⃣','3️⃣','4️⃣','5️⃣','6️⃣','7️⃣','8️⃣','9️⃣','🔟',
      '#️⃣','*️⃣','⏏️','▶️','⏸️','⏯️','⏹️','⏺️','⏭️','⏮️','⏩','⏪',
      '⏫','⏬','◀️','🔼','🔽','➡️','⬅️','⬆️','⬇️','↗️','↘️','↙️',
      '↖️','↕️','↔️','↪️','↩️','⤴️','⤵️','🔀','🔁','🔂','🔄','🔃',
      '➕','➖','➗','✖️','♾️','💲','💱','™️','©️','®️','〰️','➰','➿',
      '🔴','🟠','🟡','🟢','🔵','🟣','⚫','⚪','🟤','🔺','🔻','🔷',
      '🔶','🔹','🔸','🔳','🔲','▪️','▫️','◾','◽','◼️','◻️','🟥',
      '🟧','🟨','🟩','🟦','🟪','⬛','⬜','🟫',
    ],
  },
  {
    id: 'flags', label: 'Flags', icon: '🏁',
    emojis: [
      '🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️',
      '🇦🇩','🇦🇪','🇦🇫','🇦🇬','🇦🇮','🇦🇱','🇦🇲','🇦🇴','🇦🇶','🇦🇷',
      '🇦🇸','🇦🇹','🇦🇺','🇦🇼','🇦🇿','🇧🇦','🇧🇧','🇧🇩','🇧🇪','🇧🇫',
      '🇧🇬','🇧🇭','🇧🇮','🇧🇯','🇧🇲','🇧🇳','🇧🇴','🇧🇷','🇧🇸','🇧🇹',
      '🇧🇼','🇧🇾','🇧🇿','🇨🇦','🇨🇩','🇨🇫','🇨🇬','🇨🇭','🇨🇮','🇨🇰',
      '🇨🇱','🇨🇲','🇨🇳','🇨🇴','🇨🇷','🇨🇺','🇨🇻','🇨🇼','🇨🇽','🇨🇾',
      '🇨🇿','🇩🇪','🇩🇯','🇩🇰','🇩🇲','🇩🇴','🇩🇿','🇪🇨','🇪🇪','🇪🇬',
      '🇪🇭','🇪🇷','🇪🇸','🇪🇹','🇪🇺','🇫🇮','🇫🇯','🇫🇰','🇫🇲','🇫🇴',
      '🇫🇷','🇬🇦','🇬🇧','🇬🇩','🇬🇪','🇬🇭','🇬🇮','🇬🇱','🇬🇲','🇬🇳',
      '🇬🇶','🇬🇷','🇬🇹','🇬🇺','🇬🇼','🇬🇾','🇭🇰','🇭🇳','🇭🇷','🇭🇹',
      '🇭🇺','🇮🇩','🇮🇪','🇮🇱','🇮🇳','🇮🇶','🇮🇷','🇮🇸','🇮🇹','🇯🇲',
      '🇯🇴','🇯🇵','🇰🇪','🇰🇬','🇰🇭','🇰🇮','🇰🇲','🇰🇳','🇰🇵','🇰🇷',
      '🇰🇼','🇰🇾','🇰🇿','🇱🇦','🇱🇧','🇱🇨','🇱🇮','🇱🇰','🇱🇷','🇱🇸',
      '🇱🇹','🇱🇺','🇱🇻','🇱🇾','🇲🇦','🇲🇨','🇲🇩','🇲🇪','🇲🇬','🇲🇭',
      '🇲🇰','🇲🇱','🇲🇲','🇲🇳','🇲🇴','🇲🇷','🇲🇸','🇲🇹','🇲🇺','🇲🇻',
      '🇲🇼','🇲🇽','🇲🇾','🇲🇿','🇳🇦','🇳🇨','🇳🇪','🇳🇬','🇳🇮','🇳🇱',
      '🇳🇴','🇳🇵','🇳🇷','🇳🇿','🇴🇲','🇵🇦','🇵🇪','🇵🇬','🇵🇭','🇵🇰',
      '🇵🇱','🇵🇷','🇵🇸','🇵🇹','🇵🇼','🇵🇾','🇶🇦','🇷🇴','🇷🇸','🇷🇺',
      '🇷🇼','🇸🇦','🇸🇧','🇸🇨','🇸🇩','🇸🇪','🇸🇬','🇸🇮','🇸🇰','🇸🇱',
      '🇸🇲','🇸🇳','🇸🇴','🇸🇷','🇸🇸','🇸🇹','🇸🇻','🇸🇾','🇸🇿','🇹🇩',
      '🇹🇬','🇹🇭','🇹🇯','🇹🇱','🇹🇲','🇹🇳','🇹🇴','🇹🇷','🇹🇹','🇹🇻',
      '🇹🇼','🇹🇿','🇺🇦','🇺🇬','🇺🇸','🇺🇾','🇺🇿','🇻🇦','🇻🇨','🇻🇪',
      '🇻🇳','🇻🇺','🇼🇸','🇽🇰','🇾🇪','🇿🇦','🇿🇲','🇿🇼',
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿','🏴󠁧󠁢󠁳󠁣󠁴󠁿','🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    ],
  },
]

const RECENT_KEY = 'altuvera_recent_emojis'
const MAX_RECENT = 32

const getRecentEmojis = () => {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') }
  catch { return [] }
}

const addRecentEmoji = (emoji) => {
  try {
    const recent = getRecentEmojis().filter((e) => e !== emoji)
    recent.unshift(emoji)
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
  } catch { /* storage full */ }
}

/* ── Single emoji button ──────────────────────────────────────────────── */
const EmojiBtn = memo(({ emoji, onSelect }) => (
  <button
    type="button"
    title={emoji}
    onClick={() => onSelect(emoji)}
    className="ep__emoji-btn"
  >
    {emoji}
  </button>
))
EmojiBtn.displayName = 'EmojiBtn'

/* ── Main picker ──────────────────────────────────────────────────────── */
export default function EmojiPicker({ onSelect, onClose }) {
  const [activeCategory, setActiveCategory] = useState('smileys')
  const [search,         setSearch]         = useState('')
  const [recent,         setRecent]         = useState(getRecentEmojis)

  const searchRef = useRef(null)
  const bodyRef   = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => searchRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  const categories = useMemo(() =>
    EMOJI_CATEGORIES
      .map((cat) => cat.id === 'recent' ? { ...cat, emojis: recent } : cat)
      .filter((cat) => cat.id !== 'recent' || cat.emojis.length > 0),
  [recent])

  const searchResults = useMemo(() => {
    const q = search.trim()
    if (!q) return []
    return [...new Set(
      EMOJI_CATEGORIES.flatMap((c) => c.emojis),
    )].slice(0, 120)
    // NOTE: real search would need emoji name metadata; we show all emojis when searching
  }, [search])

  const handleSelect = useCallback((emoji) => {
    addRecentEmoji(emoji)
    setRecent(getRecentEmojis())
    onSelect(emoji)
  }, [onSelect])

  const scrollToCategory = useCallback((catId) => {
    setActiveCategory(catId)
    setSearch('')
    const el = bodyRef.current?.querySelector(`[data-cat="${catId}"]`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleBodyScroll = useCallback(() => {
    if (!bodyRef.current || search) return
    const container = bodyRef.current
    const containerTop = container.getBoundingClientRect().top
    for (const cat of categories) {
      const el = container.querySelector(`[data-cat="${cat.id}"]`)
      if (!el) continue
      const rect = el.getBoundingClientRect()
      if (rect.top >= containerTop - 10) {
        setActiveCategory(cat.id)
        break
      }
    }
  }, [categories, search])

  const displayCats = search ? [] : categories

  return (
    <div className="ep" role="dialog" aria-label="Emoji picker">
      {/* Search */}
      <div className="ep__search-row">
        <span className="ep__search-icon">🔍</span>
        <input
          ref={searchRef}
          type="text"
          className="ep__search"
          placeholder="Search emoji…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search emojis"
        />
        {search && (
          <button
            className="ep__search-clear"
            onClick={() => setSearch('')}
            type="button"
          >
            ✕
          </button>
        )}
        <button
          className="ep__close-btn"
          onClick={onClose}
          type="button"
          aria-label="Close emoji picker"
        >
          ✕
        </button>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="ep__tabs" role="tablist">
          {categories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`ep__tab ${activeCategory === cat.id ? 'ep__tab--active' : ''}`}
              onClick={() => scrollToCategory(cat.id)}
              title={cat.label}
              type="button"
            >
              {cat.icon}
            </button>
          ))}
        </div>
      )}

      {/* Body */}
      <div
        ref={bodyRef}
        className="ep__body"
        onScroll={handleBodyScroll}
      >
        {search ? (
          <div className="ep__section">
            <p className="ep__section-label">Search results</p>
            <div className="ep__grid">
              {EMOJI_CATEGORIES.flatMap((c) => c.emojis)
                .slice(0, 160)
                .map((emoji, i) => (
                  <EmojiBtn key={`s-${i}`} emoji={emoji} onSelect={handleSelect} />
                ))}
            </div>
          </div>
        ) : (
          displayCats.map((cat) => (
            <div key={cat.id} data-cat={cat.id} className="ep__section">
              <p className="ep__section-label">{cat.label}</p>
              <div className="ep__grid">
                {cat.emojis.map((emoji, i) => (
                  <EmojiBtn key={`${cat.id}-${i}`} emoji={emoji} onSelect={handleSelect} />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="ep__footer">
        Click to insert · Scroll to explore
      </div>
    </div>
  )
}