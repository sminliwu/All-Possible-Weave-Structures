// port of allpossstructs.py to JS

class WeaveStruct {
  constructor(size = 4) {
    this.size = size;
    let row = [];
    for (let i=0; i < size; i++) {
      row.push(-1);
    }
    for (let i=0; i < size; i++) {
      this.data.push(Array.from(row));
    }
  }

  toString() {
    let res = "";
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        res += this.data[row][col].toString();
      }
    }
    return res;
  }

  printRow(n, tab = true, nl = true) {
    let printme = tab ? "\t" : "";
    for (let x=0; x<this.size; x++) {
      printme += (this.data[n][x] < 0) ? "-" : this.data[n][x].toString(); 
    }
    return nl ? printme + "\n" : printme;
  }

  print() {
    let printme = "";
    for (let row=0; row<this.size; row++) {
      printme += this.printRow(row);
    }
    return printme;
  }

  copy() {
    let copy = new WeaveStruct(this.size);
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        copy.data[row][col] = this.data[row][col]
      }
    }
    return copy;
  }

  matches(w) {
    return (this.toString() == w.toString());
  }

  row(n) {
    return this.data[n];
  }

  col(n) {
    let res = [];
    for (let x=0; x<this.size; x++) {
      res.push(this.data[x][n]);
    }
    return res;
  }

  // all data editing methods leave the original WeaveStruct object unchanged, returning a modified copy
  
  unsetAll(val = 0) {
    if (val < 0) {
      return new WeaveStruct(this.size).data;
    } else {
      let res = self.copy();
      for (let row=0; row<this.size; row++) {
        for (let col=0; col<this.size; col++) {
          if (this.data[row][col] == val) {
            res.data[row][col] = -1;
          }
        }
      }
      return res;
    }
  }

  rotate(n = 1) {
    let x = (n+4) % 4;
    if (x <= 0) {
      return this.copy();
    } else {
      let res = new WeaveStruct(this.size);
      res.data = [];
      for (let i=0; i<this.size; i++) {
        res.data.unshift(this.col(i));
      }
      return res.rotate(n-1);
    }
  }

  rowShift(n=1) {
    let ret = this.copy();
    for (let i=0; i < n; i++) {
      ret.unshift(ret.pop());
    }
    return ret;
  }

  colShift(n=1) {
    return this.rotate().rowShift(n).rotate(-1);
  }

  fill(row, col, val) {
    let res = this.copy();
    res.data[row][col] = val;
    return res;
  }

  // LOGIC FUNCTIONS: is WeaveStruct ___ ?

  isValid() {
    // if each row + col has at least one interlacement (one 1 and one 0)
    for (row in this.data) {
      if (row.includes(0) && row.includes(1)) {}
      else { return false; }
    }
    for (col in this.rotate().data) {
      if (col.includes(0) && col.includes(1)) {}
      else { return false; }
    }
    return true;
  }

  // whether this WeaveStruct and w are row shifts of each other
  isRowShift(w) {
    let s = this.copy();
    for (let i=0; i<=this.size; i++) {
      if (s.matches(w)) { return true; }
      s = s.rowShift();
    }
    return false;
  }

  // whether this WeaveStruct and w are col shifts of each other
  isColShift(w) {
    return this.rotate().isRowShift(w.rotate());
  }

  // whether this WeaveStruct and w are some combination of (row, col) shifts of each other
  isSomeShift(w) {
    if (this.isRowShift(w)) { return true; }
    let s = this.rowShift();
    for (let i=0; i<=this.size; i++) {
      if (s.isColShift(w)) { return true; }
      s = s.rowShift();
    }
    return false;
  }

  // counting/parsing functions for fills
  numUnset() {
    let res = 0;
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        if (this.data[row][col] < 0) { res += 1; }
      }
    }
    return res;
  }

  firstUnset() {
    for (let row=0; row<this.size; row++) {
      for (let col=0; col<this.size; col++) {
        if (this.data[row][col] < 0) { return [row, col]; }
      }
    }
  }

  numFillOptions() {
    return pow(2,(this.numUnset()));
  }
}