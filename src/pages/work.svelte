<script>
const workItems = [
	{ 
		heading: '#metoo: Clusters of Tweets', 
		details: 'For my final thesis, I scraped nearly 1.4 million tweets from the public twitter search page to analyze the language within. Using kmeans cluster analysis, I find themes in the tweets and seek to answer the question: "what are people really saying about #metoo?" This thesis took me all over the world — I spoke about it at Antenna during Dutch Design Week, the Design Indaba Conference in Cape Town, as a lightning talk at Eyeo Festival in Minneapolis, and as a d3.js meet up talk. The best video of this talk is to the right, and the files from the d3.js meet-up are located here.',
		image: {
			src: 'assets/metoo.png',
			alt: 'image'
		},
		button: { text: 'explore clusters', url: 'https://efrymire.github.io/thesis/index.html'}
	},
	{ 
		heading: 'The 162 Sailing Stones of Death Valley', 
		details: 'In 1993, Dr. Paula Messina carefully recorded the movements of 162 of these stones in death valley over a period of 3 months. This 40x40 poster visualized the journey of each stone, aggregating these movements for an interesting comparison of direction and distance, as if they all originated from a single start point. ',
		image: {
			src: 'assets/sailingstones.png',
			alt: 'image'
		},
		button: { text: 'learn more', url: 'https://efrymire.github.io/portfolio/sailingstones.html'}
	},
	{ 
		heading: 'Ice Cream Turf Wars', 
		details: 'The infamous "ice cream turf wars" between Mister Softee and New York Ice Cream Company have played out over almost a decade in this big city playground. This 40x40 poster details this story through excerpts from news sources throughout the years, and as each company developed their own identity.',
		image: {
			src: 'assets/icecream.png',
			alt: 'image'
		},
		button: { text: 'check it out', url: 'https://efrymire.github.io/portfolio/icecream.html'}
	},
	// { 
	// 	heading: 'Scraping, Cleansing, and Mapping Data', 
	// 	details: 'As part of a Data Structures course, this project scraped 10 websites using javascript, parsed text files, cleaned results, passed through the google API for coordinates, and build JSON objects stored in a Mongo database. The result? A map of all AA meetings in manhattan for the current day of the week. [The data is no longer housed on EC2, but you can review the assignment on github here and check out my code submission on my github here.]',
	// 	image: {
	// 		src: 'assets/lowres_notebook.jpg',
	// 		alt: 'image'
	// 	},
	// 	button: { text: null, url: ''}
	// },
	{ 
		heading: 'Exploring Equality: Visualizing the relationship between gender inequality and income inequality', 
		details: 'This visualization was designed to illustrate clear relationships between gender and income inequality, while simultaneously educating the user on the process of calculating male and female indexes in relation to income inequality. By understanding the impact of gender equality on income equality, and the striking difference in male and female indexes based on country, we can work to raise female indexes, thus lowering gender and income inequality.',
		image: {
			src: 'assets/undp.png',
			alt: 'image'
		},
		button: { text: 'play with it', url: ''}
	},
]

function handleClick(url) {
	window.open(url, "_blank")
}

</script>

<main>
	<div class="Work">

		<div class="intro">
			<h1>WORK</h1>
			<p>The following are just a few examples of Ellie's work during her time at Parson's School of Design. She currently works at <a href="http://two-n.com/" target="_blank">Two-N</a>, a data visualization studio in chinatown, and contributes to <a href="http://two-n.com/projects" target="_blank">their projects.</a></p>
		</div>

		{#each workItems as item}
			<div class="{'work-item'}">
				<img class="{'work-item-img'}" src={item.image.src} alt={item.image.alt}><img/>
				<div class="{'work-item-details'}">
					<h3 class="heading">{item.heading}</h3>
					<p class="details">{item.details}</p>
					{#if item.button.text}
						<span class="button" on:click={() => handleClick(item.button.url)}>{item.button.text}</span>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</main>

<style type="text/scss">

	main {
		font-family: "Source Sans Pro";
		margin: 0% 10%;
	}

	.intro {
		border-bottom: 1px solid black;
		padding: 25px 0px;
		margin: 0;
	}

	.work-item {
		display: grid;
		grid-template-columns: 200px auto;
		grid-template-rows: auto;
		grid-column-gap: 30px;
		margin: 50px 0px;
		padding-bottom: 50px;
		border-bottom: 1px solid black;
	}

	.work-item-img {
		grid-column: 1 / 2;
		grid-row: 1 / end;
		width: 200px;
		height: 200px;
		border: 1px solid #DCDCDC;
		object-fit: contain;
	}

	.work-item-details {
		grid-column: 2 / end;
		grid-row: 1 / end;
	}

	h3 {
		margin: 0;
	}

	.button {
		font-size: 12px;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.05em;
		padding: 10px;
		color: white;
		background-color: black;
		cursor: pointer;
	}
	
	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>