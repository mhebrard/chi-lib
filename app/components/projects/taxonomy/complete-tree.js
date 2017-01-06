const bkeys = []; // array of node keys
const bobjs = []; // array of nodes
const ranks = ['no rank', 'superkingdom', 'kingdom', 'subkingdom', 'superphylum', 'phylum', 'subphylum',
  'superclass', 'class', 'subclass', 'infraclass', 'superorder', 'order', 'suborder', 'infraorder', 'parvorder',
  'superfamily', 'family', 'subfamily', 'tribe', 'subtribe', 'genus', 'subgenus',
  'species group', 'species subgroup', 'species', 'subspecies', 'varietas', 'forma'];

export default function CompleteTree(data) {
  // root init.
  const root = {name: 'root', children: [], data: {hits: 0, rank: 'no rank', sample: 0}, id: '1'}; // skeleton tree
  bkeys.push(root.id);
  bobjs.push(root);

  // Create skeleton and leaves complete(root,parent,sample)
  complete(data, '', 1);
  return root;
}

function complete(n, p, s) {
  // Create skeleton tree and leaves with assigned hits
	// avoid space in id
  n.id = (String(n.id)).replace(/\s+/g, '_');
	// avoid no rank
  if (n.data.rank === 'no rank' && p !== '') {
    n.data.rank = p.data.rank;
  }

  // update skeleton
  let nsk; // skeleton node of n
  const idx = bkeys.indexOf(n.id);
  if (idx > -1) { // if node exist
    nsk = bobjs[idx]; // existing node

    // New branch is deeper, need rebase
    if (p !== '' && ranks.indexOf(p.data.rank) > ranks.indexOf(nsk.parent.data.rank)) {
      // disconnect skeleton
      nsk.parent.children.splice(
        nsk.parent.children.indexOf(nsk), 1
      );

			// connect with deeper
      const psk = bobjs[bkeys.indexOf(p.id)];
      psk.children.push(nsk);
    }
  } else { // else new skeleton node
    const psk = bobjs[bkeys.indexOf(p.id)];
    nsk = {name: n.name,
      children: [],
      parent: psk,
      data: {hits: 0, rank: n.data.rank, sample: 0},
      id: n.id
    };
    psk.children.push(nsk);
    bkeys.push(nsk.id);
    bobjs.push(nsk);
  }

  // Add tag node
  if (n.data.assigned !== '0') {
    const tag = {name: n.name,
      children: [],
      data: {
        hits: Number(n.data.assigned),
        rank: n.data.rank,
        sample: s // ,
        // percent: Number(n.data.assigned) * 100 / h[s]
      },
      id: n.id
    };
    nsk.children.push(tag);
  }

  // recursive call
  if (n.children.length > 0) {
    n.children.forEach(c => complete(c, n, s));
  }
}
