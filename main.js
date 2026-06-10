let graph_box = document.getElementById("graphBox");
let proof_box = document.getElementById("proofBox");

let ignorable = [" ", ",", "\n"]

let numbers = ["0","1","2","3","4","5","6","7","8","9"]




const Graph = class {
    constructor(vertices) {
        this.inner =  Array(vertices).fill().map(() => Array(vertices).fill(0));
        alert("graph init")
        this.complete = false;
    }
    insertEdge(edge) {
        this.inner[edge.a][edge.b] = 1;
        if (!edge.oriented) {
            this.inner[edge.b][edge.a] = 1;
        }
    }
}

const Edge = class {
    constructor(a, b, oriented) {
        this.a=a;
        this.b=b;
        this.oriented = oriented;
    }
}


function skipWhitespace(text, at) {
    while (text[at] in ignorable) {
        at++;
    }
    return at;
}

function parseNumber(text, at) {
    at = skipWhitespace(text, at);
    let acc = "";
    if (! (text[at] in numbers)) {throw new Error("Parsing error at " + at + ", expecting number.")}
    while (text[at] in numbers) {
        acc += text[at];
        at += 1;
    }
    return [Number(acc), at];
}

function parseOrientation(text, at) {
    at = skipWhitespace(text, at);
    if (text[at] == "") {return [true, at+1]}
    if (text[at] == "-") {
        if (text[at+1] == ">") { return [true,at+2] }
        else { return [false, at+1]}
    }

}

function parseEdge(text, at) {
    let num1, num2;
    console.log("Eitthvað silly")
    at = skipWhitespace(text, at);
    [num1, at] = parseNumber(text, at);
    [oriented, at] = parseOrientation(text, at);
    [num2, at] = parseNumber(text, at);
    console.log("found edge")
    return [new Edge(num1, num2, oriented), at]
}

function parseGraph(graph_text) {

    let e = null;
    let edges = [];
    let at = 0;
    while (at < graph_text.length) {
        console.log("Looking for edge")
        [e, at] = parseEdge(graph_text, at);
        edges.append(e);
    }

    let vertex_count = Math.max(...edges.map(e => Math.max(e.a, e.b)));

    let out_graph = new Graph(vertex_count);
    
    alert(edges[0].oriented + " " +  vertex_count);

    edges.forEach(out_graph.insertEdge)
    
}


function parseProof(proof_text) {
    
}

let proof_steps = []; 
let graphs = [];
function parse() {
    let graph_text = graphBox.value;
    graph = parseGraph(graph_text);
    let proof_text = proofBox.value;
    proof_steps = parseProof(proof_text);
    
}



function validateProof() {
    parse()
}

