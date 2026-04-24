//==================================
//==== load JavaScript + console
// https://nodejs.org/en/download

console.log('Hello woarld!');
console.log(6666);


//==================================
//============ Variables
// var <--- We gebruiken voorlopig enkel dit. 
// let 
// const



//==================================
//============ Uitleg
// De code is steeds in het Engels, uitleg is (momenteel) meestal in het Nederlands.

//!!! TEACHER SAYS: 
// Voorbeeld Belgie, Duitsland, Japan, Frankrijk
// https://youtu.be/uy2LRxdlgWA?si=TZ3Y0e-wvVykQGOT&t=6
// Iets geleerd uit de video?
// - Taal is een middel om te communiceren. Een tool.
// - Talen zijn niet altijd makkelijk en logisch. Ze evolueren door gebruik en geschiedenis.
// - Programmeertalen zijn ook talen om te communiceren. Alleen niet met mensen maar met computers. Programmeertalen gebruiken Engelse woorden omdat Engels de "standaard" is geworden in de technologie wereld. Desondanks zijn ze moeilijker te begrijpen dan het Engels omdat het abstracter is.



//==================================
//============ DataTypes
var string = 'dit is een string'; // geef logische namen met camelCasing
// var string2 = '4'; // hiermee kan je niet berekenen.....
var number = 1337;
var boolean = true; // or false
var array = new Array(1,2,3,4); // je maakt hier een nieuwe array

var niks = null;
var bestaatNiet = undefined;

number = 3;
console.log(number);


// TODO: Assignment 0 //
// TODO: Assignment 1a //
// TODO: Assignment 1b //




//==================================
//============ Arithmetic Operators 

// + - * /
// console.log(2*3); // multiply


//============ Some examples
var life = 5;
life = life - 2;
// console.log(life);

life -= 2;
// console.log(life);

// TODO: Assignment 2 //


//==================================
//============ Connect data 
console.log("My favourite number is: " + 6);
// console.log("My favourite number is", 6); // optioneel. Hoef je niet te kennen



//==================================
//============ Access Array 
var brands = new Array('hp', 'dell', 'asus');
var brands2 = ['hp', 'dell', 'asus']; // Doet exact hetzelfde als hierboven
var brands3 = [ // Doet ook hetzelfde maar is netter wanneer we meer data hebben.
    'hp', // index = 0 - index is de naam voor de plaats in de array
    'dell', 
    'asus',
    'packard bell',
    'apple',
    'alienware'
];

console.log(brands3[0]); // eerste element. Arrays starten steeds bij 0


// TODO: Assignment 3 //




//==================================
//============ Pseudo code
// Voorbeeldopdracht: Tel hoeveel elementen er in een lijst (numbers) zijn.

// ============ Nederlands
// SLA getallen OP ALS [1,2,3,4]
// SLA geteldeGetallen OP ALS 0

// VOOR ELK getal IN getallen
//     VERHOOG geteldeGetallen MET 1
// EINDE VOOR ELK

//============ English 
// SET numbers TO [1,2,3,4]
// SET countedNumbers TO 0

// FOR EACH number IN numbers
//    INCREASE countedNumbers WITH 1
// END FOR EACH

// ============ JavaScript
var numbers = [1,2,3,4];
var countedNumbers = 0;

for(var number of numbers){
    // De eerste keer dat dit uitgevoerd wordt, is 'number' gelijk aan '1'.
    // Dit wordt 4x uitgevoerd
    countedNumbers += 1;
    console.log('counted numbers: ' + countedNumbers);
    // console.log('counted numbers:', countedNumbers); // of zo
}



//==================================
//============ Loop methods

//============ Simple for loop - detailed
for(var index = 0; index < 10; index++){ // For of loopt automatisch door een array. For loopt door wat je zelf meegeeft.
    // Deze gaat van 0 tot 9
}

//============ Simple for loop - compact
for(var i = 0; i < 10; i++){ // met ++ kunnen we ook iets met 1 verhogen. Er bestaat natuurlijk ook --.

}

//============ For loop - loop through array
var stopAt = brands3.length; // .length haalt het aantal elementen in de array op (6).
for(var i = 0; i < stopAt; i++){  // De for-loop start bij 0 en stopt na 5. Aan het einde van elke loop gaat i (initieel 0) met 1 omhoog.
    console.log(brands3[i]); // Dankzij i kunnen we makkelijk het huidige element in de array ophalen.
}

// TODO: Assignment 4a //
// TODO: Assignment 4b //

//============ Stop the loop
for(var i = 0; i < stopAt; i++){  
    if(i == 2) break; // Doelstelling bereikt! "break;" stopt de loop
}

// TODO: Assignment 4c //

// Als we een index nodig hebben, gebruiken we for. Zo niet, gebruik we for...of.

// TODO: Assignment 5 //

//!!! TEACHER SAYS: 
// Vele andere methodes maar sommigen zullen we later bekijken. Je dient ze niet allemaal te kunnen. Sommigen (misschien met weinig ervaring) zweren erbij dat ze allemaal hun nut hebben maar eerlijk waar, je kan alles doen met deze twee. 
// Een kleine tip: Gebruik een for loop als je de index nodig hebt. Gebruik een for of loop als je enkel de data nodig hebt.

// fruits.forEach((fruit) => console.log(fruit));

// fruits.forEach((fruit) => {
//     // console.log(fruit);
//     // console.log(fruit);
//     // console.log(fruit);
// });



//==================================
//============ If...else

// SET isItFun TO false
// IF isItFun IS false THEN
//     LOG 'ow snaps'
//     SET isItFun TO true
// ELSE
//     LOG 'yay'
// END IF

var isItFun = false; // 1x "is gelijk aan", is data veranderen

if(isItFun == false){ // 2x "is gelijk aan", is data vergelijken
    console.log('ow snap');
    isItFun = true;
}else{
    console.log('yay');

}

if(isItFun == true){
    console.log('yay 2');
}

// TODO: Assignment 6 //


//============ If...else...else if
var bomen = 10;
var zaadjes = 5;

if(bomen >= 15){
    console.log('voldoende?');

}else if(bomen == 1 && zaadjes > 0){
    console.log('bomen planten!');

}else if(bomen == 1 || zaadjes > 100){
    console.log('bomen planten!');

}else{
    console.log('degelijk?');

}


// TODO: Assignment 7 //

// TODO: Assignment 8 //

//==================================
//============ Functions
function sayHello(){
	console.log('Hello!');
}
sayHello();


//============ Change data inside function
var damageAmount = 10;
var playerHealth = 100;
var enemyHealth = 100;

function dealDamage(){
    playerHealth -= damageAmount; // We kunnen niet vanzelf aan deze variabelen binnen de functie omdat ze buiten de functie zijn gedefinieerd.
    console.log(playerHealth);
}

dealDamage();
dealDamage();
dealDamage();


//============ Pass data through functions
function dealDamageV2(characterHealth, damageAmount = 10){
    characterHealth -= damageAmount;
    console.log(characterHealth);

    return characterHealth;
}

playerHealth = dealDamageV2(playerHealth, 3);


// TODO: Assignment 9 //

//==================================
//============ Arrays manipuleren

var fruits2 = new Array(
    'banana',
    'apple',
    'pie',
    'strawberry',
    'kiwi',
    'kiwi'
);


//============ toevoegen
fruits2.push('coconut'); // Voegt aan het einde toe
fruits2.push('granaatappel', 'appelsien');

console.log(fruits2);

//============ verwijderen (basics)
fruits2.pop(); // verwijdert de laatste
console.log(fruits2); 

removedFruit = fruits2.pop();
console.log(removedFruit);
console.log(fruits2); 

fruits2.shift(); // verwijdert het eerste element
console.log(fruits2);

//============ verwijderen (geavanceerd)
fruits2.splice(0, 2); // verwijdert de eerste twee elementen in dit voorbeeld
console.log(fruits2);

var removedFruits = fruits2.splice(0, 2); // verwijdert de eerste twee elementen
console.log("removed fruits: " + removedFruits);
console.log("removed fruits: ", removedFruits); // alternatieve methode
// Weet, de console is je beste vriend. Deze is niet enkel voor fouten. 
console.log(fruits2);

// verschillende console functies
console.error('Something went wrong!');
// console.warning();
// console.debug();
// console.info();
// console.trace(fruits2);

//============ Kopieren
fruits2.slice(1,1); // Kopieert het tweede element
// Splice en slice lijken op elkaar maar doen iets totaal anders. Splice verwijdert elementen, slice kopieert elementen.

fruits2.length; // telt het aantal elementen in de array


var fruits3 = new Array(
    'banana',
    'apple',
    'pie',
    'strawberry',
    'kiwi',
    'kiwi'
);

//============ Samenvoegen
console.log(fruits3.join(' en ook '));

var fruits4 = fruits2.concat(fruits3); // fruits3 en fruits2 samengevoegd/gefusioneerd
console.log(fruits4);


// TODO: Assignment 10 //