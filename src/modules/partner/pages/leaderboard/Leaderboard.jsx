import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchLeaderboard } from "@/modules/partner/store/features/leaderboard/leaderboardThunk"
import {
  Trophy,
  Building2,
  MapPin,
  Globe,
  IndianRupee,
  Radio,
  User,
  Crown,
} from "lucide-react"

const formatINR = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)

const createDummyPartners = (startRank = 1) =>
  Array.from({ length: 10 }, (_, i) => ({
    partner_id: `dummy-${i + 1}`,
    rank: startRank + i,
    name: "New Partner",
    profile_image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 1}`,
    commission_earned: 0,
  }))

const getRankMeta = (rank) => {
  if (rank === 1)
    return {
      ring: "ring-4 ring-amber-400 ring-offset-2",
      bar: "bg-amber-400",
      barH: "h-24",
      avatarSize: "w-16 h-16",
      pt: "pt-0",
      numColor: "text-amber-900",
    }

  if (rank === 2)
    return {
      ring: "ring-4 ring-slate-300 ring-offset-2",
      bar: "bg-slate-300",
      barH: "h-16",
      avatarSize: "w-14 h-14",
      pt: "pt-6",
      numColor: "text-slate-700",
    }

  if (rank === 3)
    return {
      ring: "ring-4 ring-orange-300 ring-offset-2",
      bar: "bg-orange-300",
      barH: "h-10",
      avatarSize: "w-12 h-12",
      pt: "pt-10",
      numColor: "text-orange-900",
    }

  return {}
}

const PodiumCard = ({ item, selfRank }) => {
  const meta = getRankMeta(item.rank)
  const isMe =
  selfRank &&
  String(item.partner_id) === String(selfRank.partner_id)
  const isDummy = String(item.partner_id).includes("dummy")
  return (
    <div className={`flex flex-col items-center ${meta.pt} ${isDummy ? "opacity-60" : ""} relative`}>
      <div className="relative">

        {item.rank === 1 && !isDummy && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2">
            <Crown size={16} className="text-amber-500 fill-amber-400" />
          </div>
        )}

        <img
          src={item.profile_image}
          className={`${meta.avatarSize} rounded-full object-cover ${meta.ring} bg-white`}
        />

        {isMe && (
          <span className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1 border-2 border-white">
            <User size={9} className="text-white" />
          </span>
        )}
      </div>

      <p className="mt-2 text-xs font-bold text-gray-800 text-center">
        {item.name}
      </p>

      <p className="text-xs text-emerald-600 font-semibold">
        {formatINR(item.commission_earned)}
      </p>

      <div
        className={`w-full mt-2 ${meta.bar} ${meta.barH} rounded-t-xl flex items-center justify-center`}
      >
        <span className={`font-black text-xl ${meta.numColor}`}>
          {item.rank}
        </span>
      </div>
    </div>
  )
}

const RankRow = ({ item, selfRank }) => {
  const isMe =
  selfRank &&
  String(item.partner_id) === String(selfRank.partner_id)
  const isDummy = String(item.partner_id).includes("dummy")

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
        isDummy
          ? "bg-gray-50 opacity-60"
          : isMe
          ? "bg-blue-50 border-blue-200 shadow-sm"
          : "bg-gray-50 border-gray-100 hover:bg-white"
      }`}
    >

      <span className="text-xs font-bold w-5 text-center text-gray-400">
        {item.rank}
      </span>

      <img
        src={item.profile_image}
        className="w-9 h-9 rounded-full object-cover border border-gray-200"
      />

      <p className="flex-1 text-sm font-semibold text-gray-700">
        {item.name}

        {isMe && (
          <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">
            You
          </span>
        )}
      </p>

      <div className="flex items-center gap-1 text-emerald-600">
        <IndianRupee size={11} />
        <span className="text-sm font-bold">
          {new Intl.NumberFormat("en-IN").format(item.commission_earned)}
        </span>
      </div>
    </div>
  )
}

const LeaderboardTable = ({ data }) => {
  if (!data) return null

  const rawList = data.top_10 || []
  const rawSelf = data.self_ranking

  const displayList = [
    ...rawList,
    ...createDummyPartners(rawList.length + 1).slice(0, 10 - rawList.length),
  ]

  const displaySelf = rawSelf

  const podiumOrder = [displayList[1], displayList[0], displayList[2]].filter(Boolean)

  const restList = displayList.slice(3)

  const selfInList = displayList.find(
    (i) => i.partner_id === displaySelf?.partner_id
  )

  return (
    <div className="space-y-5">

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-gray-900">
            {data.scope_label} Leaderboard
          </h2>

          <p className="text-xs text-gray-400">
            {data.scope_display}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-600 text-xs font-bold px-2 py-1 rounded-full">
          <Radio size={10} className="animate-pulse" />
          Live
        </div>
      </div>

      {/* podium */}
      <div className="grid grid-cols-3 gap-2 items-end">
        {podiumOrder.map((item) => (
          <PodiumCard key={item.partner_id} item={item} selfRank={displaySelf} />
        ))}
      </div>

      {/* list */}
      <div className="space-y-1.5">
        {restList.map((item) => (
          <RankRow key={item.partner_id} item={item} selfRank={displaySelf} />
        ))}
      </div>

      {/* self rank outside top10 */}
      {displaySelf && !selfInList && (
        <div className="border-t pt-4">

          <p className="text-xs text-gray-400 mb-2">
            Your Position
          </p>

          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200">

            <span className="text-sm font-bold text-blue-600">
              #{displaySelf.rank}
            </span>

            <p className="flex-1 text-sm font-bold text-blue-700">
              You
            </p>

            <div className="flex items-center gap-1 text-emerald-600">
              <IndianRupee size={11} />
              <span className="text-sm font-bold">
                {new Intl.NumberFormat("en-IN").format(displaySelf.commission_earned)}
              </span>
            </div>

          </div>

        </div>
      )}
    </div>
  )
}

const TABS = [
  { key: "branch", label: "Branch", Icon: Building2 },
  { key: "state", label: "State", Icon: MapPin },
  { key: "overall", label: "Overall", Icon: Globe },
]

const Leaderboard = () => {
  const dispatch = useDispatch()

  const { branch, state, overall, loading } = useSelector(
    (s) => s.partner.leaderboard
  )

  const [tab, setTab] = useState("branch")

  useEffect(() => {
    dispatch(fetchLeaderboard())
  }, [dispatch])

  const getData = () => {
    if (tab === "branch") return branch
    if (tab === "state") return state
    if (tab === "overall") return overall
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white p-4">

        <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Partner Leaderboard
            </h1>
               <p className="text-md text-gray-400">
            Top performers by commission
          </p>

        </div>

      <div className="max-w-3xl mx-auto space-y-5 mt-10">

        {/* <div className="text-center pt-2">

          <div className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-lg px-6 py-4 shadow">

            <Trophy size={16} />

            <span className="text-lg font-bold">
              Partner Rankings
            </span>

          </div>

          <p className="text-xs text-gray-400 mt-2">
            Top performers by commission
          </p>

        </div> */}

        <div className="flex gap-2 bg-white rounded-lg p-2 shadow-sm border">

          {TABS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm font-bold rounded-lg ${
                tab === key
                  ? "bg-blue-600 text-white shadow "
                  : "text-gray-400 hover:bg-gray-50"
              }`}
            >

              <Icon size={14} />

              {label}

            </button>
          ))}

        </div>

        <div className="bg-white rounded-2xl shadow border p-5">

          {loading ? (
            <p>Loading leaderboard...</p>
          ) : (
            <LeaderboardTable data={getData()} />
          )}

        </div>

      </div>

    </div>
  )
}

export default Leaderboard