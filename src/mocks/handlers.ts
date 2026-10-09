import { http, HttpResponse } from 'msw'

const nfts = [
  {
    id: 'nft-03',
    name: 'Emerald Ape #042',
    priceEth: '1.19',
    image: '/assets/images/NFT%20Artwork%2003.png',
    availableEditions: 12,
  },
  {
    id: 'nft-04',
    name: 'Sage Nomad #009',
    priceEth: '1.69',
    image: '/assets/images/NFT%20Artwork%2004.png',
    availableEditions: 8,
  },
  {
    id: 'nft-05',
    name: 'Neon Vessel #552',
    priceEth: '1.99',
    oldPriceEth: '2.29',
    image: '/assets/images/NFT%20Artwork%2005.png',
    availableEditions: 5,
  },
  {
    id: 'nft-06',
    name: 'Cosmic Bloom #118',
    priceEth: '1.29',
    image: '/assets/images/NFT%20Artwork%2006.png',
    availableEditions: 10,
  },
  {
    id: 'nft-07',
    name: 'Violet Nomad #314',
    priceEth: '1.39',
    image: '/assets/images/NFT%20Artwork%2007.png',
    availableEditions: 7,
  },
  {
    id: 'nft-08',
    name: 'Ivory Baron #088',
    priceEth: '1.79',
    image: '/assets/images/NFT%20Artwork%2008.png',
    availableEditions: 6,
  },
  {
    id: 'nft-09',
    name: 'Golden Beat #207',
    priceEth: '0.99',
    image: '/assets/images/NFT%20Artwork%2009.png',
    availableEditions: 9,
  },
  {
    id: 'nft-10',
    name: 'Golden Echo #274',
    priceEth: '0.79',
    image: '/assets/images/NFT%20Artwork%2010.png',
    availableEditions: 5,
  },
  {
    id: 'nft-11',
    name: 'Golden Signal #160',
    priceEth: '0.39',
    image: '/assets/images/NFT%20Artwork%2011.png',
    availableEditions: 11,
  },
]

export const handlers = [
  http.get('/api/nfts', () => {
    return HttpResponse.json({
      items: nfts,
      total: nfts.length,
    })
  }),
]