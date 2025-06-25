<nav className="space-y-4">
        <Link href={`/students/${id}`} className="flex items-center gap-4 px-3 py-2 hover:bg-accent rounded-md">
          <Home className="w-5 h-5" />
          <span>Dashboard</span>
        </Link>
        <Link href={`/students/${id}/payment`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <CreditCard className="w-5 h-5" />
          <span>Payment Info</span>
        </Link>
        <Link href={`/students/${id}/courses`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <BookOpen className="w-5 h-5" />
          <span>Courses</span>
        </Link>
        <Link href={`students/${id}/results`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <FileText className="w-5 h-5" />
          <span>Results</span>
        </Link>
        <Link href={`students/${id}/notice`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <Bell className="w-5 h-5" />
          <span>Notice</span>
        </Link>
        <Link href={`students/${id}/profile`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
        <Link href={`students/${id}/calender`} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
          <Calendar className="w-5 h-5" />
          <span>Calendar</span>
        </Link>

        <div className="pt-8">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 hover:bg-accent rounded-md">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>