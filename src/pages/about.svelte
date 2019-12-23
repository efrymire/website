<script>

</script>

<main>
  <div class="intro">
    <h1>ABOUT</h1>
  </div>
	<div class="About">
    <h2>Ellie creates <span class="emphasis">interactive visualizations</span> to give viewers a deeper understanding of <span class="emphasis">complex ideas.</span></h2>
    <div class="about-text">
      <p class="column about-text-column">
      As a graduate of Data Visualization at Parsons School of Design, Ellie is building upon her lifelong passion for numbers, patterns, and art. 
      <br/><br/>
      She graduated from Villanova University in 2013 with a degree in mathematics and a minor in business, then went on to spend 4 years with Deloitte Consulting, working in the technology and analytics practice. 
      </p>
      <p class="column about-text-column">
      At Parsons, she learned valuable design concepts for static and graphic visualizations. She is well versed in HTML, CSS, R, Python, and JavaScript (including libraries D3.js and p5). 
      <br/><br/>
      She currently works as a developer at <a href="http://two-n.com/" target="_blank">Two-N</a>, an award winning data visualization agency in New York. She can be reached at <a href="mailto:elliefrymire@gmail.com">elliefrymire@gmail.com.</a></p>
    </div>
	</div>
</main>

<style>
	main {
    background-image: url("../assets/lowres_about.jpeg");
    background-position: center;
    background-size: cover;
		font-family: "Source Sans Pro";
    height: 100%;
  }

  .intro {
		padding: 25px 0px;
    margin: 0 10%;
    color: rgba(255,255,255,0.5)
	}

  .emphasis {
    font-weight: 700;
  }

  .About {
    position: fixed;
    left: 40%;
    width: 50%;
    padding: 30px;
    background: rgba(255,255,255,.5);
    border-radius: 2px;
  }

  .about-text {
    border-top: 1px solid black;
    column-count: 2;
    padding-top: 20px;
    margin: 0px;
  }

  .about-text-column {
    margin: 0;
  }

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>