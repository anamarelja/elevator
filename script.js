(function () {
  const DOWN = -1;
  const UP = 1;

  class Elevator {
    constructor() {
      this.direction = 0; // -1 0 1 (down, stop, up)
      this.doorOpen = false;
      this.occupied = false;
      this.inMotion = false;
      this.capacity = 450;
      this.weight = 0;
      this.floor = 0;
      this.requests = [];
      this.HTML = document.getElementById("elevator");
    }
    makeRequest(stop, direction) {
      this.requests.push({ stop: stop, direction: direction });
    }
    toggleOccupied() {
      this.occupied = !this.occupied;
      if (this.occupied){
        document.getElementById('occ').style.backgroundColor = 'red'
      } else {
        document.getElementById('occ').style.backgroundColor = null
      }
    }
    main() {
      // ==================================
      // IZRACUNAVA TRENUTNI SPRAT LIFTA
      // ==================================
      const rect = this.HTML.getBoundingClientRect();
      if (this.direction === DOWN) {
        const breakpoint = rect.top;
        if (breakpoint < 100) this.floor = 5;
        else if (breakpoint >= 100 && breakpoint < 200) this.floor = 4;
        else if (breakpoint >= 200 && breakpoint < 300) this.floor = 3;
        else if (breakpoint >= 300 && breakpoint < 400) this.floor = 2;
        else if (breakpoint >= 400 && breakpoint < 500) this.floor = 1;
        else this.floor = 0;
      } else {
        const breakpoint = rect.bottom;
        if (breakpoint <= 100) this.floor = 5;
        else if (breakpoint > 100 && breakpoint <= 200) this.floor = 4;
        else if (breakpoint > 200 && breakpoint <= 300) this.floor = 3;
        else if (breakpoint > 300 && breakpoint <= 400) this.floor = 2;
        else if (breakpoint > 400 && breakpoint <= 500) this.floor = 1;
        else this.floor = 0;
      }

      // Ako nema zahteva, odbij!
      if (!this.requests.length) return;

      // ==================================
      // IZRACUNAVA VALIDNE REQUESTOVE / SORTIRA
      // ==================================
      const validRequests = !this.direction
        ? this.requests
        : this.requests
            // .filter((e) => !e.direction || e.direction === this.direction)
            .filter((e) =>
              this.direction === DOWN
                ? e.stop <= this.floor
                : e.stop >= this.floor
            );

      const sorted = !this.direction
        ? validRequests
        : validRequests.sort((a, b) => {
            const L = this.direction;
            const A = a.direction || this.direction;
            const B = b.direction || this.direction;
            const asc = a.stop - b.stop;
            const desc = b.stop - a.stop;
            if (A === B) {
              return A === UP ? asc : desc;
            } else {
              return A === L ? -1 : 1;
            }
          });

      // ==================================
      // RESETUJE LIFT AKO NEMA ZAHTEVA ZA OBRADU
      // ==================================
      if (this.direction && !sorted.length) {
        this.direction = 0;
      }

      // ==================================
      // POKRECE LIFT AKO IMA ZAHTEVA ZA OBRADU
      // ==================================
      if (this.direction && !this.doorOpen && this.weight < this.capacity) {
        this.move(sorted[0]);
      }

      // ==================================
      // OTVARA / ZATVRA VRATA I BRISE ZAHTEVE
      // ==================================
      if (this.inMotion && this.floor === sorted[0].stop) {
        console.log("otvorio");
        this.doorOpen = true;
        this.inMotion = false;
        this.HTML.classList.add("open");
        setTimeout(() => {
          this.HTML.classList.remove("open");
        }, 2000);
        setTimeout(() => {
          this.requests = this.requests.filter((e) => e.stop !== this.floor);
          this.doorOpen = false;
        }, 3000);
      }

      // ==================================
      // POSTAVLJA SMER LIFTA
      // ==================================
      if (!this.direction && sorted.length) {
        let request = this.occupied
          ? sorted.find((e) => !e.direction)
          : sorted[0];
        if (!request) return;
        this.direction = request.stop > this.floor ? UP : DOWN;
      }
    }

    // POMERA LIFT PO ZAHTEVU
    move(request) {
      //  updateovati HTML
      const { stop } = request;
      const transitionStep = Math.abs(this.floor - stop);

      this.HTML.className = `floor${stop} move${transitionStep}`;
      // this.HTML.style.background = "red";
      this.inMotion = true;

      //  u nekom momentu otvoriti vrata
      //  u nekom momentu zatvoriti vrata i skloniti requestove
    }
  }

  const lift = new Elevator();
  window.el = lift;
  [...document.getElementsByClassName("floor")].forEach((e, index) => {
    const upBtn = e.getElementsByClassName("up");
    const downBtn = e.getElementsByClassName("down");
    if (upBtn.length) {
      upBtn[0].addEventListener("click", () => lift.makeRequest(index, UP));
    }
    if (downBtn.length) {
      downBtn[0].addEventListener("click", () => lift.makeRequest(index, DOWN));
    }
  });
  [...document.getElementById("panel").getElementsByTagName("BUTTON")].forEach(
    (e, index, niz) => {
      if (index !== niz.length - 1)
        e.addEventListener("click", () => lift.makeRequest(5 - index));
      else e.addEventListener("click", () => lift.toggleOccupied());
    }
  );

  const intervalID = setInterval(() => lift.main(), 50);
  // setTimeout(() => {
  // clearInterval(intervalID);
  // }, 2000);
})();
