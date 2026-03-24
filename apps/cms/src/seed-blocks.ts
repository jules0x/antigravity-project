/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from './payload.config'
import { fileURLToPath } from 'url'
import path from 'path'
import * as fs from 'fs'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const VIDEO_IDS = [
  'rfoXYpR4PXI', 'Iw_i7n6UB6U', 'Oz9cespYhkE', 'Y0PS3PKmvaQ', 'yGywo81G6lk',
  '3TKyNTwD3Yk', 'rMqTPvB8czg', 'WiSUl5bJ5U0', '-KlLhD3a-K0', 'mmg3jr7Bhfo',
  'YXfBZmvu5hE', '4OSg_yRK6rQ', '0gsJbarhsGU', 'SBFe2V0qd3Q', 'l6-3kN_tRlA',
  'lM8IRKGt8ho', 'pSvwFe-LXJg', 'ExJOvJ2ywlM', 'olejFEcWZQc', 'GQ_wf78xvrs',
  'YyDyMvAu2CY', 'AJM3HCSMmQ0', '9I3G4maVeuo', '9c-eVjhPcYs', 'cinvIr-O1k8',
  'szOlMfoN-jU', '9g7QCgMm3II', 'lxwGWmFiu_w', 'lBf1kM0wBfg', 'ta6wXSsUgiw',
  'q5u1u6z6r4Q', 'Sxxhq7gTZgo', 'HP2cqCRfQ9M', '2dllo85ZSUk', 'qiopOPLFVpQ',
  '05X6XRvwwJU', 'eHSnlu9pE2M', 'X2bzOg-xd6M', 'ZIxYx3lc_bU', 'NVIZgMcVVHY',
  '_sFOWSSqyYI', 'ZZcWj_nIFBw', 'YflBqKgLyks', 'Sd_MR6ht8RM', '0QDBWcZwaCc',
  '47s8M667BIM', 'iEM9W14TsWQ', 'KTp22PKRMR8', '4Mu72opvP9o', 'xjKyzwqIT7s',
  'V2gb2rfi16k', 'jiOaJUVKN-g', 't9-253fThaE', 'E8K0mbG5UW4', 'svINLWWahBc',
  'sKl1vHEW30k', 'viYkIwexZwo', 'WthkKfXsf1', '6GljTMKGBXs', 'TdwT5JlH8gM',
  '_afxESolG1U', 'YI2T18s8roI', 'TBXcgn5eXI0', 'HpN9nkDw5Mw', 'OA2CnEfzTLw',
  '3NdKAMBAMhY', 'feQIv3wtaU0', 'paOLn2sq4As', 'tDvEFETe_CM', 'JYdJZgkJ9SI',
  'DBwgX8yBqsw', 'Yruu5D_0-QA', 'hez7bGbutBs', 'fh2n9kglppQ', 'PcHt-yRkclg',
  'ro4muDA_dMg', 'smM3t9IXJAo', 'MpfHULzBcr4', 'DMTaLAYKMlc', 'd-FKM3eZTO8',
  'RqCRxYVRCYs', 'H_lbXfaKG2Q', '7AYyZgkUf_o', 'ShiEuQk5agg', 'CWxd5VcotVo',
  'eJE_V3QACRk', 'YuLiKvqhJao', 'L7IzdvDp3_A', 'f4jgbC1Vs7Y', 'dwOMmRsvwGg',
  '8eSP3U4M8PY', 'Jm1rdmD_-Sk', 'IlDHTKMDeFw', 'Ab-uvjvGNm0', 'IM12oSq_glA',
  'mxNU6IRaBGA', '0ipv_l7KoSI', 'D2zwgQYvjrU', '3gI3W15-9_Q', 'rBtgWP0dLGs',
  'aDwOu1t-L6I', 'eTxSfz2VONE', 'xDxtQLXMfug', 'z8ZqFlw6hYg', 'o1S4_hGiti8',
  'vB_QtQscw0Y', '6OArALRZAnE', 'OLec45YPkqs', 'E6paZL7rb1g', '6pXcnsypRos',
  'eTq7PXlpA58', 'Tqb470unQxI', 'CaXtERKoPKE', 'fCGctuclgTs', 'nechCowvmNQ',
  '6OmpK1c-PTo', 'HYg1Qnl-Efo', 'Q9tPNnCWfbM', 'fYw3CGcLcS4', 'gqbJRaX9Eq4',
  '8kMBY9Rp3Z4', 'th1193WPgUA', 'fcxeDXc4RyI', '1dpu0JVGzkk', 'XPLuanytGQs',
  'ueGhhuITobI', 'Vxx4cx2D0D8', 'FXymqDN6qPg', 'LuEhIQVCGlw', '_Ox__xk3uho',
  '8r47c5VUStg', 'CyQFNPEgtwQ', '3TUV3s3Ekj4', 'MM94mzCQI-8', 'ep_9S9WH8TI',
  'tqzskGAiXIw', 'u862_2MuTr4', 'rJWVPffjo8M', 'B9PHyN4QjNI', 'kVE2GFvQhyM',
  'WEuiZFb2wHY', 'bt-RoSzsEKA', 'na1kzdDgLqI', 'UeBFEanVsp4', '-Q5qvft2i-s',
  'VSYWbRdQhlA', 'AfLEN_cbBf8', 'fbIdAkg203c', 'f5mB9U07DT0', 'K3fRI45PBQU',
  'IOsQT9F_hbU', 'jFfmyXATvQw', '6sR6IrhT1GE', 'IeRqMmprQNo', 'a41bIBvqTP0',
  'Coi87Siunvw', 'nmUpX_YnTIg', 'YfxLLWX8TM8', 'voT2fMNYsBo', 'o_ySH29RjDM',
  'zAL4rECL_so', 'IArBw3XIzF4', 'OiCdTqqfZtI', 'KPekHAF-5LI', 'VbHUP2Rap_g',
  'S-L-xO21czs', 'JCxUXY_-xwg', 'XdV-9FwwurY', 'NvYfR0klLA8', 'LvFepCCUWCg',
  'v2jfiq8Vgnw', 'KpgofR2xYvA', 'cjALu0Tykzw', 'jNQ54JuHG24', 'KDzt6yI3Dw8',
  'ErhgZhhXPvA', 'T9TvcAMENJE', 'XmGdSOhBx8E', 'qsAhbplQopk', 'U_XXcO3vzeU',
  'eriXkm_EmnE', '6SdYYq08Iq8', 'Id6-2Y_kNIs', 'MT_rmIlowFM', 'u3hKeuZMoN4',
  'lJrCrtFfMVo', 'd8MBnc90nC4', 'HVGUmvIzmsw', 'YzStpP8JkDM', 'Grx5behEoV4'
]

async function seed() {
  console.log('--- Reseeding Dynamic Gallery ---')
  const payload = await getPayload({ config })

  // 1. Create Tags
  console.log('Creating Tags...')
  const tagIds = []
  tagIds.push((await payload.create({ collection: 'tags', data: { name: 'ABSTRACT', color: 'primary' } })).id)
  tagIds.push((await payload.create({ collection: 'tags', data: { name: 'CINEMATIC', color: 'secondary' } })).id)
  tagIds.push((await payload.create({ collection: 'tags', data: { name: 'TECH', color: 'tertiary' } })).id)
  tagIds.push((await payload.create({ collection: 'tags', data: { name: 'AMBIENT', color: 'primary' } })).id)
  tagIds.push((await payload.create({ collection: 'tags', data: { name: 'LO-FI', color: 'secondary' } })).id)

  // 2. Create Author
  console.log('Creating Author...')
  const author = await payload.create({
    collection: 'authors',
    data: {
      name: 'STUDIO PRISM',
      subscribers: '245K',
      verified: true as any,
    },
  })

  // 3. Create Items
  console.log(`Creating ${VIDEO_IDS.length} items from IDs...`)
  const itemIds = []

  // Ensure we don't bombard the DB too aggressively at once, chunk it
  let validItemsCount = 0;
  for (let i = 0; i < VIDEO_IDS.length && validItemsCount < 30; i++) {
    const vid = VIDEO_IDS[i]
    if (!vid) continue
    
    // Validate video via YouTube oEmbed API
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`)
    if (!res.ok) {
      console.log(`[SKIP] Video ${vid} is unavailable or private (Status: ${res.status}).`)
      continue
    }

    // Assign 2 or 3 tags per item pseudo-randomly but deterministically
    const numTags = 2 + (validItemsCount % 2)
    const itemTags = []
    for (let j = 0; j < numTags; j++) {
      itemTags.push(tagIds[(validItemsCount + j * 2) % tagIds.length])
    }

    const item = await payload.create({
      collection: 'items',
      data: {
        youtubeID: vid,
        type: 'video',
        subtitle: `Vol. ${validItemsCount + 1}`,
        duration: '04:15',
        author: author.id,
        views: `${Math.floor(Math.random() * 900) + 10}K`,
        tags: itemTags,
      } as any,
    })
    itemIds.push(item.id)
    validItemsCount++;
  }

  // 4. Construct Gallery Page using Blocks
  console.log('Constructing Gallery Page...')
  
  // Hero Block: 1 main item, 2 side items
  const heroItem = itemIds[0]
  const sideItems = [itemIds[1], itemIds[2]]

  // Grid Block: next 8 items
  const gridItems = itemIds.slice(3, 11)

  // List Block (Pulse Check): next 6 items
  const listItems = itemIds.slice(11, 17)

  await payload.create({
    collection: 'pages',
    data: {
      title: 'The Unfiltered Archives',
      slug: 'gallery',
      layout: [
        {
          blockType: 'favorites',
          title: "Personal Vault",
          label: "FAVORITES",
        },
        {
          blockType: 'grid',
          title: "Today's Obsessions",
          subtitle: "A raw collection of pixels and sound, hand-picked for the restless.",
          label: "01 / Curated",
          items: gridItems,
        },
        {
          blockType: 'hero',
          title: "The Underground Selection",
          label: "02 / Featured",
          heroItem: heroItem,
          sideItems: sideItems,
        },
        {
          blockType: 'list',
          title: "Pulse Check",
          subtitle: "What's blowing up in the underground right now.",
          label: "03 / Realtime",
          items: listItems,
        }
      ]
    }
  })

  // Also create a dynamic homepage routing to gallery
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Home',
      slug: 'home',
      layout: [
        {
          blockType: 'grid',
          title: "Staff Picks",
          label: "01 / Highlights",
          items: itemIds.slice(20, 24),
        }
      ]
    }
  })

  console.log('--- Complete ---')
  process.exit(0)
}

seed()
