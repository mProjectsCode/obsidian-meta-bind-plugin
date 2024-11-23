<%* 
const closeUnpinnedLeaves = () => {
	const leaves = [];
	app.workspace.iterateRootLeaves(leaf => { 
		leaves.push(leaf);
	});
	leaves.forEach(leaf => {
	    if (!leaf.pinned) {
	        leaf.detach();
	    }
	});
}

closeUnpinnedLeaves();

// the return below prevents the note from being created
return;
-%>