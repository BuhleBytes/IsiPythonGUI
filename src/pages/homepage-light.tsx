"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Code,
  FileText,
  Languages,
  Lightbulb,
  Play,
  Rocket,
  Sparkles,
  Terminal,
  Users,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const navigationLinks = [
  { name: "Izijikelez (Loops)", icon: ArrowRight },
  { name: "Iimeko (Conditionals)", icon: ArrowRight },
  { name: "Iimisebenzi (Functions)", icon: ArrowRight },
  { name: "Iimpazamo (Errors)", icon: ArrowRight },
  { name: "Inguqulelo  (Variables)", icon: ArrowRight },
  { name: "Imibuzo emfutshane (Mini Quizes)", icon: ArrowRight },
  { name: "Uphononogo lwe  IDE (Explore IDE)", icon: ArrowRight },
  { name: "Izijilezi (Loops)", icon: ArrowRight },
];

export function HomepageLight() {
  const [activeFeature, setActiveFeature] = useState(0);

  const navigate = useNavigate();

  const features = [
    {
      icon: Users,
      title: "Kubafundi, ngabafundi bendawo",
      description:
        "I-IsiPython yadalwa ngabafundi bendawo abaqonda imingeni yokufunda ukuprograma ngolwimi lwesibini. Iqonga lethu livala umsantsa phakathi kwemfundo yeprogramu yesiko nokuqonda kwenkcubeko.",
    },
    {
      icon: Languages,
      title: "Ulwimi njengomqobo",
      description:
        "Abafundi abaninzi bayasokola ngeprogramu kuba kufuneka baqale bakwazi isingesi phambi kokuba baqonde iingcamango zekhowudi. I-IsiPython isusa lo mqobo ngokufundisa iingcamango zokuprograma ngolwimi lwakho lwemvelo kuqala.",
    },
    {
      icon: Lightbulb,
      title: "Funda ngokwenza",
      description:
        "Iqonga lethu elinxibelelwano likhuthaza ukufunda ngesandla. Bhala ikhowudi, ubone iziphumo ngoko nangoko, kwaye wakhe ukuzithemba ngokuzama okusebenzayo kwindawo yolwimi eyaziwayo.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm px-20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">IsiPython</h1>
                <p className="text-xs text-gray-600">
                  Ziqhelisele neProgramu eseSekwe kwisiXhosa
                </p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-6">
              <a
                href="#about"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                About
              </a>
              <a
                href="#downloads"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Downloads
              </a>
              <a
                href="#docs"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Docs
              </a>
              <a
                href="/login"
                className="text-gray-700 hover:text-cyan-600 transition-colors font-medium"
              >
                Login
              </a>
              <Button
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-100/50 via-transparent to-blue-100/50"></div>
        {/* Floating elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-cyan-200/30 to-blue-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-xl"></div>

        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border-cyan-200 shadow-sm">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Revolutionary Programming Education
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-normal">
                  IsiPython
                  <span className="block text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text">
                    Funda ukuKhowuda goLwimi Lwakho
                  </span>
                </h1>
                <p className="text-xl text-gray-700 leading-relaxed">
                  IsiPython liqonga elinobuhlobo nabantu abaqalayo elifundisa
                  iingcamango zokukhouda ngolwimi lwakho lwemvelo, okwenza
                  ukuprogram kufinyeleleke kuye wonke umntu nokuba akakho
                  mgxagxo kangakanani kwisingesi.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 shadow-lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Qala uhambo lwakho
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 bg-white shadow-sm"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Bukela iDemo
                </Button>
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Yisebenzise mahala</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                  <span>Umthombo ovulekileyo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span>Qhutywa ngumphakathi</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-600 text-sm ml-2">
                      Umzekelo wekhowudi kuIsiPython
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 border border-gray-300 rounded-lg p-4 shadow-inner">
                    <pre className="text-sm font-mono">
                      <code>
                        <span className="text-purple-400">
                          # IsiPython (IsiXhosa) version
                        </span>
                        {"\n"}
                        <span className="text-cyan-400">ukuba</span>{" "}
                        <span className="text-white">x</span>{" "}
                        <span className="text-cyan-400">==</span>{" "}
                        <span className="text-green-400">5</span>:{"\n"}
                        {"    "}
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">"x is 5"</span>){"\n"}
                        <span className="text-cyan-400">okanye</span>:{"\n"}
                        {"    "}
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">"x is not 5"</span>)
                      </code>
                    </pre>
                  </div>
                </CardContent>
              </Card>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-cyan-300/40 to-blue-300/40 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-purple-300/40 to-pink-300/40 rounded-full blur-xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section Why Choose IsiPython*/}
      <section className="py-20 px-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Kutheni umele ukhethe uIsiPython?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Sidiliza imiqobo yolwimi kwimfundo yokuprograma thina
              singuIsiPython
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card
                  key={index}
                  className={`bg-white/80 border-gray-200/80 hover:border-cyan-300 transition-all cursor-pointer group shadow-lg hover:shadow-xl ${
                    activeFeature === index
                      ? "ring-2 ring-cyan-200 border-cyan-300"
                      : ""
                  }`}
                  onClick={() => setActiveFeature(index)}
                >
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <IconComponent className="w-6 h-6 text-cyan-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Practice Section */}
      <section className="py-20 px-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ziqhelisele neProgramu eseSekwe kwisiXhosa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Funda iziseko zokukhowda ngokusebenzisa imisebenzi yokusebenzisana
              eyenzelwe ngokukodwa abathetha isiXhosa
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {navigationLinks.map((link, index) => {
              const IconComponent = link.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-cyan-300 hover:text-cyan-700 justify-between group shadow-sm"
                >
                  <span>{link.name}</span>
                  <IconComponent className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300 transition-colors group shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <Terminal className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Yakha kwaye uSebenzise iKhowudi yesiXhosa Kwi-intanethi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Bhala, udibanise, kwaye usebenzise ikhowudi yePython esekelwe
                  kwisiXhosa ngqo kwibrawuza yakho. Akukho kufakwa kufunekayo -
                  qala nje ukukhouda kwaye ubone iziphumo ngoko nangoko.
                  <br />
                  <br />
                </p>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                  <Play className="w-4 h-4 mr-2" />
                  Zama i-Online Editor (Try Online Editor)
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emarald-50 border-emarald-200 hover:border-green-300 transition-colors group shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emarald-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                  <BookOpen className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Izixhobo & Izikhokelo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed mb-6">
                  Fikelela kwithala lethu elibanzi lezikkhokelo, amaxwebhu,
                  kunye nezixhobo zoluntu. Nokuba ungumqali ogqibeleleyo okanye
                  ujonge ukuphakamisa izakhono zakho, sinezixhobo eziyilelwe
                  ngokukodwa abathi siXhosa abafunda iingcamango zokuprograma.
                </p>
                <Button className="bg-gradient-to-r from-green-600 to-lime-600 hover:from-green-700 hover:to-emarald-700 text-white shadow-lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Uxwebhu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-4xl font-bold text-gray-900">
                Qala nge-IsiPython
              </h2>
              <p className="text-xl text-gray-700 leading-relaxed">
                Qala uhambo lwakho lokuprograma namhlanje ngeqonga lethu
                elinobuhlobo nabantu abaqalayo eliyilelwe ngokukodwa abathi
                siXhosa. Joyina amawaka abafundi abafunda ukukhouda ngolwimi
                lwabo lwemvelo.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 shadow-lg"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  Qala ukufunda isiPython
                </Button>
              </div>
            </div>

            <div className="relative">
              <Card className="bg-white/80 border-gray-200/80 backdrop-blur-sm shadow-xl">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-gray-600 text-sm ml-2">
                      IsiPython IDE
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 border border-gray-300 rounded-lg p-4 space-y-2 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                      <span className="text-gray-400 text-sm">main.isi</span>
                    </div>
                    <div className="h-px bg-gray-700"></div>
                    <div className="space-y-1 text-sm font-mono">
                      <div className="text-purple-400">
                        # Welcome to IsiPython!
                      </div>
                      <div>
                        <span className="text-cyan-400">igama</span> ={" "}
                        <span className="text-green-400">"World"</span>
                      </div>
                      <div>
                        <span className="text-yellow-400">printa</span>(
                        <span className="text-green-400">f"Molo, World!"</span>)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Floating activity indicator */}
              <div className="absolute -top-2 -right-2">
                <div className="flex items-center gap-1 bg-green-100 border border-green-200 rounded-full px-2 py-1 shadow-sm">
                  <Activity className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-12">
        <div className="container mx-auto px-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Code className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Isi-Python</h3>
                <p className="text-sm text-gray-600">
                  Iqonga Lokukoda Ngolwimi Lwakho
                </p>
              </div>
            </div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              I-IsiPython liqonga lokufunda ukukoda elinobubele kubaqalayo
              elifundisa iingcamango zokukoda ngolwimi lwakho lwendalo, yenza
              ukukoda kufumaneke wonke umntu kungakhathaliseki ubuchule bakhe
              besiNges
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span>© 2024 IsiPython</span>
              <span>•</span>
              <a href="#" className="hover:text-cyan-600 transition-colors">
                Privacy Policy
              </a>
              <span>•</span>
              <a href="#" className="hover:text-cyan-600 transition-colors">
                Terms of Service
              </a>
              <span>•</span>
              <a href="#" className="hover:text-cyan-600 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
