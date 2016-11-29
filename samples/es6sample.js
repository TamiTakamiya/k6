import { group, check, sleep } from "speedboat";
import { Counter, Rate } from "speedboat/metrics";
import http from "speedboat/http";

export let options = {
	vus: 5,
	thresholds: {
		my_rate: ["rate>=0.4"],
	}
};

let mCounter = new Counter("my_counter");
let mRate = new Rate("my_rate");

export default function() {
	check(Math.random(), {
		"top-level test": (v) => v < 1/3
	});
	group("my group", function() {
		mCounter.add(1, { tag: "test" });

		check(Math.random(), {
			"random value is < 0.5": (v) => mRate.add(v < 0.5),
		});

		group("json", function() {
			let res = http.get("https://httpbin.org/get", null, {
				headers: { "X-Test": "abc123" },
			});
			check(res, {
				"status is 200": (res) => res.status === 200,
				"X-Test header is correct": (res) => res.json().headers['X-Test'] === "abc123",
			});
			// console.log(res.body);
		});

		group("html", function() {
			check(http.get("http://test.loadimpact.com/"), {
				"status is 200": (res) => res.status === 200,
				"content type is html": (res) => res.headers['Content-Type'] === "text/html",
				"welcome message is correct": (res) => res.html("h2").text() === "Welcome to the LoadImpact.com demo site!",
			});
		});

		group("nested", function() {
			check(null, {
				"always passes": true,
				"always fails": false,
			});
		});
	});
	sleep(10 * Math.random());
};
