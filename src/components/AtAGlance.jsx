import './AtAGlance.css'

const AtAGlance = () => {
  return (
    <section className="at-a-glance">
      <div className="container">
        <h1 className="h2 embellished text-center">Wisdom ✼ Spirituality ✼ Divinity</h1>
        <div className="_boxes inline-children-top">
          <div className="_box">
            <img src="/assets/img/shaktipat-xl.jpg" width="242" height="242" alt="shaktipat by Siddhaguru" />
            <p><i>Shaktipat</i></p>
            <a href="/en/shaktipat" className="btn">Know more</a>
          </div>
          <div className="_box">
            <img src="/assets/img/siddhaguru-articles.png" width="242" height="242" alt="articles from siddhaguru website" />
            <p>Articles</p>
            <a href="/en/wisdom" className="btn">Read Now</a>
          </div>
          <div className="_box">
            <img src="/assets/img/siddhaguru-consecrations-xl.jpg" width="242" height="242" alt="siddhaguru consecrations" />
            <p>Consecrations</p>
            <a href="../en/mahapeetam" className="btn">Ramaneswaram</a>
          </div>
          <div className="_box">
            <img src="/assets/img/siddhaguru-aura-xl.jpg" width="242" height="242" alt="siddhaguru divine aura" />
            <p>Aura</p>
            <a href="/en/donations" className="btn">Know More</a>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AtAGlance
