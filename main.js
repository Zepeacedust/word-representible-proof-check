let graph_box = document.getElementById("graphBox");
let proof_box = document.getElementById("proofBox");

let ignorable = [" ", ".",",", "\n", ";"]

let numbers = ["0","1","2","3","4","5","6","7","8","9"]

const opCode = {
    BRANCH	: 0,
    MOVE	: 1,
    ORIENT1	: 2,
    ORIENT2	: 3,
    SHORTCUT	: 4,
    ASSUME      : 5
}

const edgeType = {
    MISSING : 0,
    UNORIENTED : 1,
    ALONG : 2,
    AGAINST : 3,
}

const Graph = class {
    constructor(vertices) {
        this.inner =  Array(vertices).fill().map(() => Array(vertices).fill(0));
	this.complete = false;
    }
    insertEdge(edge) {
        this.inner[edge.a-1][edge.b-1] = 1;
        if (!edge.oriented) {
            this.inner[edge.b-1][edge.a-1] = 1;
        } else {
            this.inner[edge.b-1][edge.a-1] = 0;	    
	}
    }
    copy() {
	let g = new Graph(this.inner.length);
	for(let x = 0; x < this.inner.length; x++) {
	    for(let y = 0; y < this.inner.length; y++) {
		g.inner[x][y] = this.inner[x][y];
	    }
	}
	return g;
    }
    check(a,b) {
	return [
	    edgeType.MISSING,   // 0,0
	    edgeType.AGAINST,   // 0,1
	    edgeType.ALONG,     // 1,0
	    edgeType.UNORIENTED // 1,1
	][2 * this.inner[a-1][b-1] + this.inner[b-1][a-1]]
    }
    verifyCycle(c) {
	
    }
    cycleStatus(c) {
	let unoriented=0, along=0, against = 0;
	for (let i = 0; i+1<c.length; i++) {
	    switch (this.check(c[i], c[i+1])) {
	    case edgeType.UNORIENTED:
		unoriented++;
		break;
	    case edgeType.ALONG:
		along++;
		break;
	    case edgeType.AGAINST:
		against++;
		break;
	    }
	}
	switch (this.check(c[c.length-1], c[0])) {
	case edgeType.UNORIENTED:
	    unoriented++;
	    break;
	case edgeType.ALONG:
	    along++;
	    break;
	case edgeType.AGAINST:
	    against++;
	    break;
	}
	return [unoriented, along, against]
    }
}

const Edge = class {
    constructor(a, b, oriented) {
        this.a=a;
        this.b=b;
        this.oriented = oriented;
    }
}

const Operation = class {
    constructor(opcode, inputs) {
	this.opcode = opcode;
	this.inputs = inputs;
    }
}

function skipWhitespace(text, at) {
    while (ignorable.includes(text[at])) {
        at++;
    }
    return at;
}

function parseString(text, at, s) {
    if (!(text.slice(at, at+s.length) == s)) {
	throw new Error("Parse error at " + at + ": expecting \"" +s+ "\" but found \"" + text.slice(at, at+s.length) + "\"")
    }
    return at + s.length
}

function optParseString(text, at, s) {
    if (text.slice(at, at+s.length) == s) {
	return [true, at+s.length]
    }
    return [false, at]
}

function parseNumber(text, at) {
    at = skipWhitespace(text, at);
    let acc = "";
    if (!numbers.includes(text[at])) {throw new Error("Parsing error at " + at + ", expecting number but found \"" + text[at] + "\".")}
    while (numbers.includes(text[at])) {
        acc += text[at];
        at += 1;
    }
    return [Number(acc), at];
}

function parseCycle(text, at) {
    let n, cycle = [];
    at = skipWhitespace(text, at);
    [n, at] = parseNumber(text, at);
    cycle.push(n)
    while(text[at] == "-") {
	[n, at] = parseNumber(text, at+1);
	cycle.push(n);
    }
    at = skipWhitespace(text, at);
    return [cycle, at]
}

function parseOrientation(text, at) {
    at = skipWhitespace(text, at);
    if (text[at] == "→") {return [true, at+1]}
    if (text[at] == "-") {
        if (text[at+1] == ">") { return [true,at+2] }
        else { return [false, at+1]}
    }
    throw new Error("Error parsing edge at " + at +": Don't recognize \"" + text[at] + "\".")
}

function parseEdge(text, at) {
    let num1, num2, oriented;
    at = skipWhitespace(text, at);
    [num1, at] = parseNumber(text, at);
    [oriented, at] = parseOrientation(text, at);
    [num2, at] = parseNumber(text, at);
    return [new Edge(num1, num2, oriented), at]
}

function parseGraph(graph_text) {
    let e = null;
    let edges = [];
    let at = 0;
    while (at < graph_text.length) {
        [e, at] = parseEdge(graph_text, at);
        edges.push(e);
    }
    let vertex_count = Math.max(...edges.map(e => Math.max(e.a, e.b)));
    let out_graph = new Graph(vertex_count);
    edges.forEach((e) => out_graph.insertEdge(e))
    return out_graph;
}

function parseOperation(text, at) {
    at = skipWhitespace(text, at);
    let e, c, dest, e2;

    switch (text[at]) {
    case "O":
	at = skipWhitespace(text, at+1);
	if (text[at] == "O") {
	    at = parseString(text, at, "O");
	    at = skipWhitespace(text, at);
	    [e, at] = parseEdge(text, at);
	    at = skipWhitespace(text, at);
	    [e2, at] = parseEdge(text, at);
	    at = skipWhitespace(text, at);
	    at = parseString(text, at, "(C");
	    [c, at] = parseCycle(text, at);
	    at = parseString(text, at, ")");
	    console.log("Found double orientation at " + at);
	    return [new Operation(opCode.ORIENT2, {"e1":e, "e2":e2, "c":c}), at];
	}

	[e, at] = parseEdge(text, at);
	at = skipWhitespace(text, at);
	
	at = parseString(text, at, "(C");
	at = skipWhitespace(text, at);
	[c, at] = parseCycle(text, at);
	at = parseString(text, at, ")");
	console.log("found single orientation at " +at);
	return [new Operation(opCode.ORIENT1, {"e":e, "c":c}), at];
    case "B":
	//expect oriented edge, followed by (Copy n) where n is a new graph to be populated
	[e, at] = parseEdge(text, at+1);
	at = skipWhitespace(text, at);
	at = parseString(text, at, "(Copy ");
	[dest, at] = parseNumber(text, at);
	at = parseString(text, at, ")")
	console.log("found branch at " + at)
	return [new Operation(opCode.BRANCH, {"e":e, "dest":dest}), at];

    case "M":
	at = parseString(text, at, "MC");
	at = skipWhitespace(text, at);
	[dest, at] = parseNumber(text, at);
	at = skipWhitespace(text, at);
	[_, at] = optParseString(text, at, ";");
	at = skipWhitespace(text, at);
	[e, at] = parseEdge(text, at);
	console.log("Found move at " + at)
	return [new Operation(opCode.MOVE, {"e":e, "dest":dest}), at];
 
    case "S":
	at=skipWhitespace(text, at+1);
	[_,at]=optParseString(text, at, ":");
	at = skipWhitespace(text,at);
	[c,at]=parseCycle(text, at);
	console.log("Found shortcut at " + at)
	return [new Operation(opCode.SHORTCUT, {"c":c}), at];
    default:
	if (numbers.includes(text[at])) {
	    [e, at] = parseEdge(text, at);
	    return [new Operation(opCode.ASSUME, {"e":e}), at];
	}
	console.log(text[at])
	throw new Error("Something went horribly wrong around " + at + ".")
    }
}

function parseProof(proof_text) {
    let at = 0;
    let steps = [];
    let step;
    while (at < proof_text.length) {
	[_, at] = optParseString(proof_text, at, "L");
	if (numbers.includes(proof_text[at])) {
	    [_, at] = parseNumber(proof_text, at);
	}
	[_, at] = optParseString(proof_text, at, ":");

	[_, at] = optParseString(proof_text, at, ".");
	[step, at] = parseOperation(proof_text, at);
	at = skipWhitespace(proof_text, at);
	steps.push(step);
    }
    return steps;
}

let proof_steps = []; 
let graphs = [];
let current_graph = 0;

function parse() {
    let graph_text = graphBox.value;
    graphs = [parseGraph(graph_text)];
    let proof_text = proofBox.value;
    proof_steps = parseProof(proof_text);
    
}


function applyOperation(operation) {
    let unoriented = 0, along=0, against=0, c, e, e1, e2, dest;
    
    switch (operation.opcode) {
    case opCode.BRANCH:
	graphs.push(graphs[current_graph].copy())
	graphs[current_graph].insertEdge(operation.inputs["e"]);
	return;
    case opCode.MOVE:
	current_graph = operation.inputs["dest"] - 1
	graphs[current_graph].insertEdge(operation.inputs["e"]);
	return
    case opCode.ORIENT1:
	c = operation.inputs["c"];
	graphs[current_graph].verifyCycle(c);
	[unoriented, along, against] = graphs[current_graph].cycleStatus(c);
	if (unoriented != 1) {
	    throw new Error("Trying to orient one edge in cycle that does not have exactly one unoriented edge, it has " + unoriented + ".")
	}
	if (along != 1 && against != 1) {
	    throw new Error("Cycle does not satisfy precondition of lemma 1.")
	}
	graphs[current_graph].insertEdge(operation.inputs["e"]);
	[unoriented, along, against] = graphs[current_graph].cycleStatus(c);
	if (against != 2 && along != 2) {
	    throw new Error("Addding edge did not result in well-formed cycle.")
	}
	return;
    case opCode.ORIENT2:
	c = operation.inputs["c"];
	e1 = operation.inputs["e1"];
	e2 = operation.inputs["e2"];

	graphs[current_graph].verifyCycle(c);
	[unoriented, along, against] = graphs[current_graph].cycleStatus(c);
	if (unoriented != 2) {
	    throw new Error("Trying to orient two edges in cycle that does not have exactly two unoriented edges, it has " + unoriented + ".")
	}
	
	graphs[current_graph].insertEdge(e1);
	graphs[current_graph].insertEdge(e2);
	[unoriented, along, against] = graphs[current_graph].cycleStatus(c);
	if (against != 2 && along != 2) {
	    throw new Error("Addding edge did not result in well-formed cycle.")
	}
	return;
    case opCode.SHORTCUT:
	c = operation.inputs["c"];
	for (let i = 0; i+1<c.length; i++) {
	    if (graphs[current_graph].check(c[i], c[i+1]) != edgeType.ALONG) {
		console.log([c[i], c[i+1], graphs[current_graph].check(c[i], c[i+1])])
		throw new Error("Shortcut path invalid.");
	    }
	}
	if (graphs[current_graph].check(c[0],c[c.length-1]) != edgeType.ALONG) {
	    throw new Error("shortcut not real shortcut.");
	}
	graphs[current_graph].complete=true;
	return;
    case opCode.ASSUME:
	graphs[current_graph].insertEdge(operation.inputs["e"])
	
    }
}



function validateProof() {
    parse();
    current_graph = 0;
    for (let i = 0; i<proof_steps.length; i++) {
	applyOperation(proof_steps[i])
    }
    if (graphs.every((g)=>g.complete)) {
	alert("Proof is correct");
    }
}

