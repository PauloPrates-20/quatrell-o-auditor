// Initializes firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, collection, getDoc, setDoc, addDoc, updateDoc, deleteDoc, serverTimestamp } = require('firebase/firestore');
const { collections } = require('../../config');
const { Player } = require('../classes');
const { firebaseConfig } = require('../../config');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* Firestore custom querys */

// Player register function
async function registerPlayer(playerData) {
	// Sets doc reference and convert the data to firestore Map
	const ref = doc(db, collections.users, playerData.id.toString());
	const convertedPlayer = Object.assign({}, playerData);

	try {
		await setDoc(ref, convertedPlayer);

		console.log(`Player ${playerData.id} registered successfuly.`);
	} catch (error) {
		console.error(`Error registering player: ${error}`);
	}
}

// Log register function
async function registerLog(logData, playerId) {
	const ref = collection(db, collections.users, playerId.toString(), 'logs');
	const convertedLog = {
		...logData,
		timestamp: serverTimestamp(),
	};

	try {
		await addDoc(ref, convertedLog);
		console.log(`Log registered succesfully for player ${playerId}.`);
	} catch (error) {
		console.error(`Error registering log: ${error}`);
	}
}

// Load player function
async function loadPlayer(playerId) {
	const ref = doc(db, collections.users, playerId.toString());

	try {
		const querySnapshot = await getDoc(ref);

		const data = querySnapshot.data();

		return new Player(data.id, data.gold, data.gems, data.characters);
	} catch (error) {
		console.error(`Unable to load player: ${error}`);
	}
}

// Update player function
async function updatePlayer(playerData) {
	const ref = doc(db, collections.users, playerData.id.toString());

	const data = Object.assign({}, playerData);
	delete data.id;

	try {
		await updateDoc(ref, data);

		console.log(`Player ${playerData.id} updated successfuly`);
	} catch (error) {
		console.error(`Unable to update player ${playerData.id}: ${error}`);
	}
}

async function deletePlayer(playerId) {
	const ref = doc(db, collections.users, playerId.toString());

	try {
		await deleteDoc(ref);

		console.log(`Player ${playerId} deleted successfully.`);
	} catch (error) {
		console.error(`Failed to delete player ${playerId}: ${error}`);
	}
}

module.exports = {
	registerPlayer,
	registerLog,
	loadPlayer,
	updatePlayer,
	deletePlayer,
};