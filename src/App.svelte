<script>

	// import components
	import Home	from './pages/home.svelte'
	import About	from './pages/about.svelte'
	import Work	from './pages/work.svelte'

	// import state
	export let page;

	// this component's script
	const pages = [
		{ name: 'home', component: Home, link: null },
		{ name: 'about', component: About, link: null },
		{ name: 'work', component: Work, link: null },
		{ name: 'github', component: null, link: "https://github.com/efrymire" },
		{ name: 'resume', component: null, link: "https://drive.google.com/file/d/19N6Coaf4pHDEgD-uCZ-2iq3PyD20Nc3z/view?usp=sharing" }
	]

	let active = pages[0]

	function handleClick(newPage) {
		if (newPage.component) {
			page = newPage.name
			active = newPage
		}
		if (newPage.link) {
			window.open(newPage.link.toString(), "_blank")
		}
	}

</script>

<main>
	<div class="page">
		<svelte:component this={active.component}/>
	</div>
	<div class="footer">
		<h1 on:click={() => handleClick(pages[0])}>Ellie Frymire</h1>
		<div class="navigation">
		{#each pages as page}
			<span class:active={active.name === page.name} on:click={() => handleClick(page)} >{page.name}</span>
		{/each}
		</div>
	</div>
</main>

<style>

	main {
		height: 100vh;
	}

	.page {
		height: 100%;
	}

	.footer {
		position: fixed;
		left: 0px;
		bottom: 0px;
		padding: 10px 10%;
		display: flex;
		height: 60px;
		width: 100%;
		background: rgba(255,255,255,.5)
	}

	.navigation {
		font-family: "Source Sans Pro";
		margin: 10px;
		display: flex;
	}

	.active {
		border-bottom: 1px solid black;
	}

	:global(h1) {
		text-transform: uppercase;
		letter-spacing: 0.1em;
		margin: 10px 0px;
	}

	:global(h2) {
    margin: 0;
    margin-bottom: 20px;
    text-transform: uppercase;
    font-size: 20px;
    font-weight: 500;
  }

	:global(a) {
		color: black;
	}

	:global(a:visted) {
		color: black;
	}

	span {
		margin: 0px 10px;
		padding: 10px;
		font-size: 18px;
		text-transform: uppercase;
		cursor: pointer;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>