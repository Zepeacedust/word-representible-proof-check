let graph_box = document.getElementById("graphBox");
let proof_box = document.getElementById("proofBox");

let ignorable = [" ", ",", "\n"]


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
    while (text)
}

function parseNumber(text, at) {
    while (text[at] in ignorable) {
        at += 1;
    }
}

function parseEdge(text, at) {
    at = skipWhitespace(text, at);
}

function parseEdge(edge_text) {
    let oriented = false;
    let secondStart = 0;
    let mid = edge_text.indexOf("-");
    if (mid != -1){
        secondStart = mid+1;
        if (edge_text[mid+1] == ">") {
            oriented = true;
            secondStart = mid+2;
        }
    } else {
        mid = edge_text.indexOf("→");
        secondStart = mid+1;
    }
    return new Edge(
        Number(edge_text.slice(0,mid)),
        Number(edge_text.slice(secondStart, edge_text.length)),
        oriented
    );
}

function parseGraph(graph_text) {
    let lines = graph_text.split("\n");
    let edges = lines.map(parseEdge);
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

