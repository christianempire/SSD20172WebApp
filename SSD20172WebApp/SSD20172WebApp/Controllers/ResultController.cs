using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace SSD20172WebApp.Controllers
{
    [Route("[controller]/[action]")]
    public class ResultController : Controller
    {
        public IActionResult Simple()
        {
            return View();
        }

        public IActionResult Advanced()
        {
            return View();
        }
    }
}