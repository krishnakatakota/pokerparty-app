import { Injectable } from "@angular/core";
import { Card, Suit, Rank } from "../objects/card";
import { Player } from "../objects/player";
import { PokerHandResult } from "../objects/pokerHandResult";

import { PpWsService } from "./pp-ws.service";

@Injectable({
	providedIn: "root",
})
export class DealerService {
	playerList: Player[] = [];

	deck: Card[] = [];
	community: Card[] = [];

	addPlayer(newPlayer: Player) {
		this.playerList.push(newPlayer);
	}

	getPlayerList(): Player[] {
		return this.playerList;
	}

	// add the 52 cards (unshuffled) to this.deck
	generateDeck(): void {
		this.deck = [];
		for (let suit = 0; suit < Object.keys(Suit).length / 2; suit++) {
			for (let rank = 2; rank <= Object.keys(Rank).length / 2 + 1; rank++) {
				this.deck.push({ suit, rank });
			}
		}
	}

	// shuffle this.deck in place
	shuffleDeck(): void {
		this.community = [];
		this.playerList.forEach(player => {
			player.hand = [];
		});
		this.generateDeck();
		// TODO actually implement this
		for (let i = this.deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
		}
	}

	// set the hand[] array of each player to an array of two Cards
	dealHands(): void {
		const numPlayers = this.playerList.length;
		for (let i = 0; i < numPlayers; i++) {
			const hand = [this.deck.pop()!, this.deck.pop()!]; // Deal two cards to each player
			this.playerList[i].hand = hand;
		}
	}

	dealCommunityCards(): void {
		for (let i = 0; i < 5; i++) {
			this.community.push(this.deck.pop()!);
		}
	}

	determineWinner(): Player[] {
		let playerResults: any[] = []; // [id, result]
		this.playerList.forEach((player) => {
			playerResults.push([player.id, this.scoreHand(player.hand)]);
		});
		playerResults.sort((a: any, b: any) => {
			return b[1].value - a[1].value;
		});
		let winners: Player[] = [];
		// check for split pots
		for (let i = 0; i < this.playerList.length; i++) {
			if (playerResults[i][1].value == playerResults[0][1].value) {
				winners.push(this.playerList[playerResults[i][0]]);
			}
		}
		return winners;
	}

	scoreHand(hand: Card[]): PokerHandResult {
		// return the best poker hand from a set or sets of cards
		let cards = hand.concat(this.community);

		// start empty
		let best = this._result(cards);

		// find best hand
		for (let combination of this._combinations(cards, 5)) {
			// calculate value of 5 cards
			let result = this._calculate(combination);
			if (result.value > best.value) best = result;
		}

		// finish with best result
		return best;
	}

	_result(cards: Card[], name?: string, value?: number): PokerHandResult {
		return {
			cards: cards,
			name: name || "nothing",
			value: value || 0,
		};
	}

	_combinations(cards: Card[], groups: number): Card[][] {
		// card combinations with the given size
		let result: Card[][] = [];

		// not enough cards
		if (groups > cards.length) return result;

		// one group
		if (groups == cards.length) return [cards];

		// one card in each group
		if (groups == 1) return cards.map((card) => [card]);

		// everything else
		for (let i = 0; i <= cards.length - groups; i++) {
			let head = cards.slice(i, i + 1);
			let tails = this._combinations(cards.slice(i + 1), groups - 1);
			for (let tail of tails) {
				result.push(head.concat(tail));
			}
		}

		return result;
	}

	_ranked(cards: Card[]): Card[][] {
		// undefined workaround
		// split cards by rank
		let result: Card[][] = [];

		for (let card of cards) {
			let r = card.rank;
			result[r] = result[r] || [];
			result[r].push(card);
		}

		// condense
		result = result.filter((rank) => !!rank);

		// high to low
		result.reverse();

		// pairs and sets first
		result.sort((a, b) => {
			return a.length > b.length ? -1 : a.length < b.length ? 1 : 0;
		});

		return result;
	}

	_isFlush(cards: Card[]): boolean {
		// all suits match is flush
		let suit = cards[0].suit;

		for (let card of cards) {
			if (card.suit != suit) return false;
		}

		return true;
	}

	_isStraight(ranked: Card[][]): boolean {
		// must have 5 different ranks
		if (!ranked[4]) return false;

		// could be wheel if r0 is 'ace' and r4 is '2'
		if (
			ranked[0][0].rank == 14 &&
			ranked[1][0].rank == 5 &&
			ranked[4][0].rank == 2
		) {
			// hand is 'ace' '5' '4' '3' '2'
			ranked.push(ranked.shift()!); // why does this exclamation mark work
			// ace is now low
			return true;
		}

		// run of five in row is straight
		let r0 = ranked[0][0].rank;
		let r4 = ranked[4][0].rank;
		return r0 - r4 == 4;
	}

	_value(ranked: Card[][], primary: number): number {
		// primary wins the rest are kickers
		let str = "";

		for (let rank of ranked) {
			// create two digit value
			let r = rank[0].rank;
			let v = (r < 10 ? "0" : "") + r;
			for (let i = 0; i < rank.length; i++) {
				// append value for each card
				str += v;
			}
		}

		// to integer
		return primary * 10000000000 + parseInt(str);
	}

	_calculate(cards: Card[]): PokerHandResult {
		// determine value of hand

		let ranked: Card[][] = this._ranked(cards);
		let isFlush = this._isFlush(cards);
		let isStraight = this._isStraight(ranked);

		if (isStraight && isFlush && ranked[0][0].rank == 14)
			return this._result(cards, "royal flush", this._value(ranked, 9));
		else if (isStraight && isFlush)
			return this._result(cards, "straight flush", this._value(ranked, 8));
		else if (ranked[0].length == 4)
			return this._result(cards, "four of a kind", this._value(ranked, 7));
		else if (ranked[0].length == 3 && ranked[1].length == 2)
			return this._result(cards, "full house", this._value(ranked, 6));
		else if (isFlush)
			return this._result(cards, "flush", this._value(ranked, 5));
		else if (isStraight)
			return this._result(cards, "straight", this._value(ranked, 4));
		else if (ranked[0].length == 3)
			return this._result(cards, "three of a kind", this._value(ranked, 3));
		else if (ranked[0].length == 2 && ranked[1].length == 2)
			return this._result(cards, "two pair", this._value(ranked, 2));
		else if (ranked[0].length == 2)
			return this._result(cards, "one pair", this._value(ranked, 1));
		else return this._result(cards, "high card", this._value(ranked, 0));
	}

	cardToString(card: Card): string {
		let suitSymbol: string;

		switch (card.suit) {
			case Suit.Hearts:
				suitSymbol = "H";
				break;
			case Suit.Diamonds:
				suitSymbol = "D";
				break;
			case Suit.Clubs:
				suitSymbol = "C";
				break;
			case Suit.Spades:
				suitSymbol = "S";
				break;
			default:
				suitSymbol = "";
		}

		let rankString: string;

		if (card.rank <= 10) {
			rankString = `${card.rank}`;
		} else {
			switch (card.rank) {
				case Rank.Jack:
					rankString = `J`;
					break;
				case Rank.Queen:
					rankString = `Q`;
					break;
				case Rank.King:
					rankString = `K`;
					break;
				case Rank.Ace:
					rankString = `A`;
					break;
				default:
					rankString = "";
			}
		}

		return `${rankString}${suitSymbol}`;
	}

	// determineWinner(players: Player[], communityCards: Card[]): { winner: Player; handDescription: string } {
	//     let winner = players[0];
	//     let winningHand = evaluateHand(players[0].hand, communityCards);

	//     for (let i = 1; i < players.length; i++) {
	//         const currentHand = evaluateHand(players[i].hand, communityCards);
	//         if (currentHand.value > winningHand.value) {
	//             winner = players[i];
	//             winningHand = currentHand;
	//         }
	//     }

	//     return { winner, handDescription: winningHand.description };
	// }
	constructor() {
		this.generateDeck();
	}
}
